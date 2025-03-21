import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import User from '@/lib/models/user';
import { initTherapySession } from '@/lib/gemini';

// Get all sessions for the current user
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoDB();
    
    // Find or create user
    let dbUser = await User.findOne({ clerkId: user.id });
    if (!dbUser) {
      dbUser = await User.create({
        clerkId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username || user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl
      });
    }
    
    const sessions = await Session.find({ userId: user.id }).sort({ startTime: -1 });
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new session
export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToMongoDB();
    
    // Initialize a new chat session with Gemini
    const chat = await initTherapySession();
    
    // Create a new session in the database
    const session = await Session.create({
      userId: user.id,
      messages: [
        {
          role: 'assistant',
          content: "Hello! I'm therapyAI, and I'm here to provide a supportive space for you to talk about what's on your mind. How are you feeling today, and what brings you to this session?",
          timestamp: new Date()
        }
      ]
    });
    
    // Add session to user's sessions
    await User.findOneAndUpdate(
      { clerkId: user.id },
      { $push: { sessions: session._id } }
    );
    
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// app/api/sessions/[sessionId]/messages/route.js
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

// app/api/sessions/[sessionId]/todo/route.js
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';
import { generateTodoList } from '@/lib/gemini';

export async function POST(req, { params }) {
  try {
    const { sessionId } = params;
    const { endSession } = await req.json();
    
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

// app/api/sessions/[sessionId]/feedback/route.js
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