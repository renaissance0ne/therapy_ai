"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ISession } from '@/lib/models/sessionTypes';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface SessionChatProps {
  session: ISession;
}

export default function SessionChat({ session }: SessionChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize with messages from the session
    return session.messages.map((msg, index) => ({
      id: `msg-${index}`,
      content: msg.content,
      isUser: msg.role === 'user'
    }));
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      content: input,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/sessions/${session._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    setIsEndingSession(true);
    
    try {
      const response = await fetch(`/api/sessions/${session._id}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endSession: true })
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      const data = await response.json();
      
      if (data.todoList) {
        // Redirect to the todo page
        router.push(`/session/${session._id}/todo`);
      } else {
        throw new Error('No todo list was generated');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session. Please try again.');
      setIsEndingSession(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-dark-3 rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-primary-500 text-light-1'
                  : 'bg-dark-4 text-light-2'
              }`}
            >
              <div 
                dangerouslySetInnerHTML={{ __html: message.content }}
                className="break-words"
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-dark-4 text-light-2 p-3 rounded-lg flex items-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-light-3 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-light-3 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-light-3 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-dark-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isEndingSession}
            placeholder="Type a message..."
            className="flex-1 bg-dark-2 border border-dark-4 rounded-lg px-4 py-2 text-light-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isEndingSession}
            className="bg-primary-500 text-light-1 p-2 rounded-lg disabled:opacity-50"
          >
            <Image src="/assets/share.svg" alt="Send" width={20} height={20} />
          </button>
          <button
            type="button"
            onClick={handleEndSession}
            disabled={isEndingSession}
            className="bg-dark-4 text-light-1 px-4 py-2 rounded-lg hover:bg-dark-3 disabled:opacity-50"
          >
            {isEndingSession ? 'Ending...' : 'End Session'}
          </button>
        </form>
      </div>
    </div>
  );
}