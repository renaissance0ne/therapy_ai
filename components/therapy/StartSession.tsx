"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StartSession() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartSession}
      disabled={isLoading}
      className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-light-1 rounded-lg transition-all duration-300 font-medium disabled:opacity-50"
    >
      {isLoading ? 'Starting...' : 'Start New Session'}
    </button>
  );
}