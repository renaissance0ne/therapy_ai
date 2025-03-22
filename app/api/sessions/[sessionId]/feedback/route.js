import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { processFeedback } from '@/lib/gemini';

export async function POST(req, { params }) {
  try {
    const { sessionId } = params;
    const { completedTasks, moodRating, feedback } = await req.json();
    
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
    
    // Update todo list completion status
    if (completedTasks && Array.isArray(completedTasks)) {
      completedTasks.forEach(taskId => {
        const task = session.todoList.id(taskId);
        if (task) {
          task.completed = true;
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