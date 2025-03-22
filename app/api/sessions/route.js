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

