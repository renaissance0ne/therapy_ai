import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { generateTodoList, initTherapySession } from '@/lib/gemini';

type EndSessionData = {
  endSession: boolean;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
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
    
    // Get previous incomplete todos
    const previousSession = await Session.findOne({
      userId: user.id,
      completed: true,
      _id: { $ne: sessionId }
    }).sort({ endTime: -1 });
    
    const previousTodos = previousSession?.todoList
      .filter(todo => !todo.completed)
      .map(todo => todo.task) || [];
    
    // Initialize chat with history
    const chat = await initTherapySession(user.id);
    
    // Generate todo list
    const todoListText = await generateTodoList(chat, session.messages, previousTodos);

    // Improved parsing of todo items
    // First remove HTML tags
    const cleanText = todoListText.replace(/<[^>]*>/g, '');
    
    // Try to find numbered items first (1. Task description)
    let todoItems: string | any[] = [];
    const numberedItems = cleanText.match(/\d+\.\s+([^\n]+)/g);
    
    if (numberedItems && numberedItems.length > 0) {
      todoItems = numberedItems.map(item => {
        const task = item.replace(/^\d+\.\s+/, '').trim();
        return { task, completed: false, createdAt: new Date() };
      });
    } else {
      // Try looking for bullet points
      const bulletItems = cleanText.match(/[•\-\*]\s+([^\n]+)/g);
      if (bulletItems && bulletItems.length > 0) {
        todoItems = bulletItems.map(item => {
          const task = item.replace(/^[•\-\*]\s+/, '').trim();
          return { task, completed: false, createdAt: new Date() };
        });
      } else {
        // Split by lines and filter for likely task-like content
        const lines = cleanText.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && line.length < 200)  // Reasonable task length
          .filter(line => !line.toLowerCase().includes('todo') && !line.toLowerCase().includes('here')) // Filter headers
          .filter(line => !line.toLowerCase().startsWith('based on') && !line.toLowerCase().startsWith('i recommend')); // Filter intro text
          
        if (lines.length >= 2) {
          todoItems = lines.slice(0, 5).map(line => ({
            task: line,
            completed: false, 
            createdAt: new Date()
          }));
        }
      }
    }
    
    // If no items were extracted, use default tasks
    if (todoItems.length === 0) {
      todoItems = [
        { task: "Take a 15-minute walk outside", completed: false, createdAt: new Date() },
        { task: "Practice deep breathing for 5 minutes", completed: false, createdAt: new Date() },
        { task: "Write down three things you're grateful for", completed: false, createdAt: new Date() }
      ];
    }
    
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
