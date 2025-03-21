// app/(root)/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StartSession from "@/components/therapy/StartSession";

export default async function Home() {
  const user = await currentUser();
  
  // If user is not signed in, show registration prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-2">
        <div className="p-8 bg-dark-1 rounded-xl shadow-2xl max-w-md w-full border border-dark-4">
          <div className="flex flex-col items-center space-y-6">
            <div className="rounded-full bg-primary-500 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-light-1">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-light-1">Welcome to therapyAI</h1>
            
            <p className="text-light-2 text-center">Create an account to begin your journey to better mental health</p>
            
            <div className="w-full pt-4">
              <Link 
                href="/sign-up" 
                className="flex justify-center items-center w-full bg-primary-500 hover:bg-primary-600 text-light-1 py-3 px-6 rounded-lg transition-all duration-300 font-medium"
              >
                Sign Up
              </Link>
              
              <div className="mt-4 text-center">
                <span className="text-light-3">Already have an account? </span>
                <Link href="/sign-in" className="text-primary-500 hover:text-primary-400 font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full p-6 bg-dark-2 rounded-xl mb-8">
        <h1 className="text-3xl font-bold text-light-1 mb-4">Welcome to therapyAI</h1>
        <p className="text-light-2 mb-6">
          Your AI companion for mental wellbeing. Start a new therapy session or continue where you left off.
        </p>
        
        <StartSession />
      </div>
      
      <div className="w-full p-6 bg-dark-2 rounded-xl">
        <h2 className="text-xl font-semibold text-light-1 mb-4">How it works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-3 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center mb-3">
              <span className="text-light-1 font-bold">1</span>
            </div>
            <h3 className="text-light-1 font-medium mb-2">Start a Session</h3>
            <p className="text-light-3 text-sm">Have a conversation with therapyAI about what's on your mind</p>
          </div>
          
          <div className="p-4 bg-dark-3 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center mb-3">
              <span className="text-light-1 font-bold">2</span>
            </div>
            <h3 className="text-light-1 font-medium mb-2">Get a Todo List</h3>
            <p className="text-light-3 text-sm">Receive personalized activities to improve your mental wellbeing</p>
          </div>
          
          <div className="p-4 bg-dark-3 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center mb-3">
              <span className="text-light-1 font-bold">3</span>
            </div>
            <h3 className="text-light-1 font-medium mb-2">Track Progress</h3>
            <p className="text-light-3 text-sm">Complete your tasks and provide feedback to improve future sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}