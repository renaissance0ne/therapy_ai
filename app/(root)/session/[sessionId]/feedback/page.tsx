import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToMongoDB from "@/lib/mongoose";
import Session from "@/lib/models/session";
import { ISession } from "@/lib/models/sessionTypes";

interface FeedbackPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const user = await currentUser();
  const resolvedParams = await params;

  if (!user) {
    redirect("/sign-in");
  }

  await connectToMongoDB();

  const sessionId = resolvedParams?.sessionId;

  if (!sessionId) {
    redirect("/");
  }

  const session = await Session.findOne({
    _id: sessionId,
    userId: user.id,
  }).exec() as ISession | null;

  if (!session) {
    redirect("/");
  }

  // Get the last AI message as feedback response
  const feedbackResponse = session.messages.length > 0 
    ? session.messages[session.messages.length - 1].content 
    : "Thank you for your feedback!";

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full p-6 bg-dark-2 rounded-xl mb-8">
        <h1 className="text-3xl font-bold text-light-1 mb-4">Feedback</h1>
        
        <div className="bg-dark-3 p-6 rounded-lg mb-8">
          <div 
            className="text-light-1"
            dangerouslySetInnerHTML={{ __html: feedbackResponse }}
          />
        </div>
        
        <div className="flex justify-between">
          <Link 
            href="/"
            className="py-3 px-6 bg-dark-3 hover:bg-dark-4 text-light-1 rounded-lg transition-all duration-300 font-medium"
          >
            Return Home
          </Link>
          
          <Link 
            href="/session/new"
            className="py-3 px-6 bg-primary-500 hover:bg-primary-600 text-light-1 rounded-lg transition-all duration-300 font-medium"
          >
            New Session
          </Link>
        </div>
      </div>
    </div>
  );
}