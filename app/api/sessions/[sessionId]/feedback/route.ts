import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { processFeedback, initTherapySession } from '@/lib/gemini';

interface ITodoItem {
  _id: string;
  task: string;
  completed: boolean;
  createdAt: Date;
}

interface ISession {
  _id: string;
  userId: string;
  todoList: ITodoItem[];
  moodAfter?: number;
  feedback?: string;
  messages: {
    role: string;
    content: string;
    timestamp: Date;
  }[];
  save: () => Promise<void>;
}

type RouteParams = {
  params: {
    sessionId: string;
  };
};

type FeedbackData = {
  completedTasks?: string[];
  moodRating: number; // Removed optional flag
  feedback?: string;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = params;
    const { completedTasks, moodRating, feedback } = await req.json() as FeedbackData;
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoDB();
    
    // Find the session
    const session = await Session.findOne({ _id: sessionId, userId: user.id }) as ISession;
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Update todo list completion status
    if (completedTasks && Array.isArray(completedTasks)) {
      completedTasks.forEach(taskId => {
        // Fix: Use find instead of id() method
        const taskIndex = session.todoList.findIndex(t => t._id.toString() === taskId);
        if (taskIndex !== -1) {
          session.todoList[taskIndex].completed = true;
        }
      });
    }
    
    // Update session with feedback
    session.moodAfter = moodRating;
    session.feedback = feedback;
    
    // Initialize chat with history
    const chat = await initTherapySession();
    
    // Process feedback with Gemini
    const aiResponse = await processFeedback(
      chat, 
      session.todoList.filter(t => t.completed).map(t => t.task), 
      moodRating
    );
    
    // Add AI response to the session
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });
    
    await session.save();
    
    return NextResponse.json({ 
      response: aiResponse
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}