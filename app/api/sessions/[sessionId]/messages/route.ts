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

type MessageData = {
  message: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Await params to fix the Next.js 14/15 error
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionId;
    
    const { message } = await req.json() as MessageData;
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToMongoDB();
    
    console.log(`Looking for session: ${sessionId} for user: ${user.id}`);
    
    const session = await Session.findOne({ 
      _id: sessionId,
      userId: user.id
    });
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Add user message to the session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Initialize chat with history
    const chat = await initTherapySession(user.id);
    
    // Send the message to Gemini
    const response = await sendMessageToGemini(chat, message);
    
    // Add AI response to the session
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
    
    await session.save();
    
    // Return the response in the format the frontend expects
    return NextResponse.json({
      id: `msg-${Date.now()}`,
      content: response,
      isUser: false
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      error: 'Failed to send message', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
