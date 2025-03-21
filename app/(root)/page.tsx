import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home(props: {
  searchParams: { [key: string]: string | undefined };
}) {
  // Await searchParams to ensure it's resolved before usage
  const searchParams = await props.searchParams;
  
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
            
            <h1 className="text-2xl font-bold text-light-1">Join Us</h1>
            
            <p className="text-light-2 text-center">Create an account to maintain a healthy mind</p>
            
            <div className="w-full pt-4">
              <Link 
                href="/home" 
                className="flex justify-center items-center w-full bg-primary-500 hover:bg-primary-600 text-light-1 py-3 px-6 rounded-lg transition-all duration-300 font-medium"
              >
                Click to begin!
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
    <>
      <h1>TEsting!</h1>
    </>
  );
}