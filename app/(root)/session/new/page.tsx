import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RedirectToSession from "@/components/therapy/RedirectToSession";

export default async function NewSessionPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // This page will redirect to the API endpoint to create a new session
  // and then redirect to the session page
  return (
    <div className="flex flex-col items-center justify-center w-full h-[70vh]">
      <div className="w-full max-w-md p-6 bg-dark-2 rounded-xl text-center">
        <h1 className="text-2xl font-bold text-light-1 mb-4">Starting New Session</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-light-2 mt-4">Please wait while we set up your therapy session...</p>
      </div>
      
      <RedirectToSession />
    </div>
  );
}