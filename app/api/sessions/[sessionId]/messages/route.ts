import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { initTherapySession, sendMessageToGemini } from '@/lib/gemini';

interface IMessage {
  id: string;
  content: string;
  isUser: boolean;
}

type RouteParams = {
  params: {
    sessionId: string;
  };
};

type MessageData = {
  message: string;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Await params to fix the Next.js 14 error
    const { sessionId } = await params;
    const { message } = await req.json() as MessageData;

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoDB();
    
    console.log(`Looking for session: ${sessionId} for user: ${user.id}`);
    
    // Find the session with more flexible error handling
    const session = await Session.findOne({ 
      $or: [
        { _id: sessionId, userId: user.id },
        { _id: sessionId }  // Try without userId as fallback
      ]
    });
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Add user message to the session
    session.messages.push({
      role: 'user' as 'user',
      content: message,
      timestamp: new Date()
    });

    // Initialize chat with history
    const chat = await initTherapySession();

    // Send the message to Gemini
    const response = await sendMessageToGemini(chat, message);

    // Add AI response to the session
    session.messages.push({
      role: 'assistant' as 'assistant', 
      content: response,
      timestamp: new Date()
    });
    
    await session.save();

    // Generate a response ID that matches the IMessage interface
    const responseId = `msg-${Date.now()}`;

    // Return a response that matches IMessage interface
    const messageResponse: IMessage = {
      id: responseId,
      content: response,
      isUser: false
    };

    return NextResponse.json(messageResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      error: 'Failed to send message', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}