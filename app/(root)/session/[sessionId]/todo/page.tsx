import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TodoList from "@/components/therapy/TodoList";
import connectToMongoDB from "@/lib/mongoose";
import Session from "@/lib/models/session";
import { ISession } from "@/lib/models/sessionTypes";

interface TodoPageProps {
  params: {
    sessionId: string;
  };
}

export default async function TodoPage({ params }: TodoPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await connectToMongoDB();

  const sessionId = params?.sessionId;

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
        <h1 className="text-3xl font-bold text-light-1 mb-4">Todo List</h1>
        <p className="text-light-2 mb-6">
          Based on your therapy session, here are some tasks that might help improve your mental wellbeing.
        </p>

        <TodoList session={JSON.parse(JSON.stringify(session))} />
      </div>
    </div>
  );
}