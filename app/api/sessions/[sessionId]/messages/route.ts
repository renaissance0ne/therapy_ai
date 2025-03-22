import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
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

    // This section needs to be replaced with your database alternative
    // Get the current session and messages
    // const session = ...
    // const chatHistory = ...

    const chat = await initTherapySession();

    // Send the message to Gemini
    const response = await sendMessageToGemini(chat, message);

    // This section needs to be replaced with your database alternative
    // Store messages
    // const savedResponse = ...

    // Replace with appropriate return value
    return NextResponse.json({ 
      id: 'generated-id', // You'll need to generate this
      content: response,
      isUser: false
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}