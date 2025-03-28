import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToMongoDB from '@/lib/mongoose';
import Session from '@/lib/models/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionId;
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToMongoDB();
    
    const session = await Session.findOne({ 
      _id: sessionId,
      userId: user.id
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      session: JSON.parse(JSON.stringify(session))
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
