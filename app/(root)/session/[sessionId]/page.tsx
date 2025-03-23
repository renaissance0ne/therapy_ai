import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SessionChat from "@/components/therapy/SessionChat";
import connectToMongoDB from "@/lib/mongoose";
import Session from "@/lib/models/session";
import { ISession } from "@/lib/models/sessionTypes";

interface SessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const user = await currentUser();
  const resolvedParams = await params;

  if (!user) {
    redirect("/sign-in");
  }

  await connectToMongoDB();

  const sessionId = resolvedParams?.sessionId;

  // Add validation
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

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full p-6 bg-dark-2 rounded-xl mb-8">
        <h1 className="text-3xl font-bold text-light-1 mb-4">Therapy Session</h1>
        <p className="text-light-2 mb-6">
          Chat with therapyAI about what's on your mind. When you're ready, click "End Session" to get your personalized todo list.
        </p>

        <SessionChat session={JSON.parse(JSON.stringify(session))} />
      </div>
    </div>
  );
}