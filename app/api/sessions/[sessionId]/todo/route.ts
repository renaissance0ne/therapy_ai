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
    
    // Parse todo list from text
    const todoItems = todoListText
      .split('<br>')
      .join('\n')
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => {
        const task = line.replace(/^\d+\./, '').trim();
        return { task, completed: false, createdAt: new Date() };
      });
    
    // If no items were extracted via regex, try an alternative approach
    if (todoItems.length === 0) {
      const alternativeItems = todoListText
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .split('\n')
        .filter(line => line.trim().length > 10)  // Filter lines with some content
        .slice(0, 5)  // Take up to 5 items
        .map(line => ({
          task: line.trim(),
          completed: false,
          createdAt: new Date()
        }));
        
      if (alternativeItems.length > 0) {
        // Update session with todo list and mark as completed
        session.todoList = alternativeItems;
        session.endTime = new Date();
        session.completed = true;
        
        await session.save();
        
        return NextResponse.json({ todoList: alternativeItems });
      }
      
      // If still no items, create a default set
      const defaultItems = [
        { task: "Take a 15-minute walk outside", completed: false, createdAt: new Date() },
        { task: "Practice deep breathing for 5 minutes", completed: false, createdAt: new Date() },
        { task: "Write down three things you're grateful for", completed: false, createdAt: new Date() }
      ];
      
      session.todoList = defaultItems;
      session.endTime = new Date();
      session.completed = true;
      
      await session.save();
      
      return NextResponse.json({ todoList: defaultItems });
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