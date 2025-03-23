"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToSession() {
  const router = useRouter();
  
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to create session');
        }
        
        const data = await response.json();
        router.push(`/session/${data.session._id}`);
      } catch (error) {
        console.error('Error creating session:', error);
        router.push('/');
      }
    };
    
    createSession();
  }, [router]);
  
  return null;
}