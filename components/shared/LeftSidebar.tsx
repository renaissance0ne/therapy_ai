"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// Define the Session interface
interface Session {
  _id: string;
  startTime: string | Date;
  completed: boolean;
}

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!userId) return;

      try {
        const response = await fetch('/api/sessions');
        const data = await response.json();
        
        if (data.sessions) {
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [userId]);

  const handleStartSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.session) {
        router.push(`/session/${data.session._id}`);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        <div className="flex flex-col gap-4">
          <h2 className="text-light-1 text-heading4-medium">Your Therapy</h2>
          
          <button
            onClick={handleStartSession}
            className="flex items-center gap-4 p-4 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Image 
              src='/assets/create.svg' 
              alt='new session' 
              width={24} 
              height={24} 
            />
            <p className='text-light-1 max-lg:hidden'>Start New Session</p>
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="text-light-1 text-heading4-medium mt-4">Previous Sessions</h3>
          
          {loading ? (
            <p className="text-light-3 text-small-regular">Loading sessions...</p>
          ) : sessions.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {sessions.map((session) => (
                <Link 
                  href={`/session/${session._id}`} 
                  key={session._id} 
                  className={`flex items-center gap-4 p-3 rounded-lg hover:bg-dark-3 transition-colors ${
                    pathname === `/session/${session._id}` ? 'bg-dark-3' : ''
                  }`}
                >
                  <Image 
                    src='/assets/reply.svg' 
                    alt='session' 
                    width={20} 
                    height={20} 
                  />
                  <div className="flex flex-col">
                    <p className='text-light-1 text-small-medium truncate w-32'>
                      Session {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className='text-light-3 text-subtle-medium'>
                      {session.completed ? 'Completed' : 'In progress'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-light-3 text-small-regular">No previous sessions</p>
          )}
        </div>
      </div>
      
      <div className='mt-10 px-6'>
        <SignedIn>
          <SignOutButton redirectUrl="/sign-in">
            <div className='flex cursor-pointer gap-4 p-4'>
              <Image 
                src='/assets/logout.svg' 
                alt='logout' 
                width={24} 
                height={24} 
              />
              <p className='text-light-2 max-lg:hidden'>Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
};

export default LeftSidebar;