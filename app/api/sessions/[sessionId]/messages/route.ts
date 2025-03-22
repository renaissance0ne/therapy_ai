import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { initTherapySession, sendMessageToGemini } from '@/lib/ai';

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
    const { sessionId } = params;
    const { message } = await req.json() as MessageData;

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current session
    const session = await db.session.findUnique({
      where: {
        id: sessionId,
        userId: user.id
      },
      include: {
        messages: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const chat = await initTherapySession();

    // Get all previous messages to recreate context
    const chatHistory = session.messages.map((msg: IMessage) => ({
      role: msg.isUser ? 'user' : 'system',
      content: msg.content
    }));

    // Send the message to Gemini
    const response = await sendMessageToGemini(chat, message);

    // Store the user message
    await db.message.create({
      data: {
        sessionId,
        content: message,
        isUser: true
      }
    });

    // Store the AI response
    const savedResponse = await db.message.create({
      data: {
        sessionId,
        content: response,
        isUser: false
      }
    });

    return NextResponse.json(savedResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}