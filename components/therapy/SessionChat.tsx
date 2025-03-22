"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define types for our component
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

interface Session {
  _id: string;
  messages: Message[];
  completed: boolean;
}

interface SessionChatProps {
  session: Session;
}

export default function SessionChat({ session }: SessionChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(session.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Add user message to UI
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Send message to API
      const response = await fetch(`/api/sessions/${session._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to the messages state
      if (data && data.content) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setIsEndingSession(true);
      
      // Call API to end session and generate todo list
      const response = await fetch(`/api/sessions/${session._id}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endSession: true }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.todoList) {
        router.push(`/session/${session._id}/todo`);
      }
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session. Please try again.');
    } finally {
      setIsEndingSession(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-3 rounded-t-lg">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary-500 text-light-1' 
                  : 'bg-dark-4 text-light-2'
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        onSubmit={handleSendMessage}
        className="flex items-center bg-dark-4 p-3 rounded-b-lg"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none text-light-1 focus:ring-0 focus:outline-none"
          disabled={isLoading || session.completed}
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading || !message.trim() || session.completed}
            className="px-4 py-2 bg-primary-500 text-light-1 rounded-lg disabled:opacity-50"
          >
            {isLoading ? '...' : 'Send'}
          </button>
          
          {!session.completed && (
            <button
              type="button"
              onClick={handleEndSession}
              disabled={isEndingSession || messages.length < 4}
              className="px-4 py-2 bg-dark-3 text-light-1 rounded-lg disabled:opacity-50"
            >
              {isEndingSession ? 'Ending...' : 'End Session'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}