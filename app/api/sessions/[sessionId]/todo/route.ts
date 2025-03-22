import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { generateTodoList, initTherapySession } from '@/lib/gemini';

type RouteParams = {
  params: {
    sessionId: string;
  };
};

type EndSessionData = {
  endSession: boolean;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Await params to fix the Next.js 14 error
    const { sessionId } = await params;
    const { endSession } = await req.json() as EndSessionData;
    
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
    
    if (!endSession) {
      return NextResponse.json({ error: 'Missing endSession parameter' }, { status: 400 });
    }
    
    // Initialize chat with history
    const chat = await initTherapySession();
    
    // Generate todo list
    const todoListText = await generateTodoList(chat, session.messages);
    
    // Parse todo list from text
    // This is a simple parser - in production you'd want something more robust
    const todoItems = todoListText
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => {
        const task = line.replace(/^\d+\./, '').trim();
        return { task, completed: false, createdAt: new Date() };
      });
    
    // Update session with todo list and mark as completed
    session.todoList = todoItems;
    session.endTime = new Date();
    session.completed = true;
    
    await session.save();
    
    return NextResponse.json({ todoList: todoItems });
  } catch (error) {
    console.error('Error generating todo list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}