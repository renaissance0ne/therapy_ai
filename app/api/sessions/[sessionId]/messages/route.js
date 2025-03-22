import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { sendMessageToGemini } from '@/lib/gemini';

export async function POST(req, { params }) {
  try {
    const { sessionId } = params;
    const { message } = await req.json();
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoDB();
    
    // Find the session
    const session = await Session.findOne({ _id: sessionId, userId: user.id });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Add user message to the session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // TODO: In a production app, you would maintain the chat session
    // For simplicity, we're creating a new one each time
    const chat = await initTherapySession();
    
    // Get all previous messages to recreate context
    const chatHistory = session.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Send message to Gemini AI
    const response = await sendMessageToGemini(chat, message);
    
    // Add AI response to the session
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
    
    await session.save();
    
    return NextResponse.json({ 
      message: {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      } 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}