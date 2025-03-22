"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Task {
  _id: string;
  task: string;
  completed?: boolean;
}

interface Session {
  _id: string;
  todoList: Task[];
}

interface TodoListProps {
  session: Session;
}

export default function TodoList({ session }: TodoListProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [moodRating, setMoodRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleTaskToggle = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/sessions/${session._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedTasks,
          moodRating,
          feedback
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      const data = await response.json();
      
      if (data.response) {
        router.push(`/session/${session._id}/feedback`);
      } else {
        throw new Error('No response data returned');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error((error as Error).message || 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-dark-2 rounded-xl">
      <h2 className="text-xl font-semibold text-light-1 mb-4">Your Todo List</h2>
      
      <div className="mb-6">
        {session.todoList && session.todoList.map((task) => (
          <div key={task._id} className="flex items-center mb-3">
            <input
              type="checkbox"
              id={task._id}
              checked={task.completed || completedTasks.includes(task._id)}
              onChange={() => handleTaskToggle(task._id)}
              disabled={task.completed}
              className="w-5 h-5 rounded border-gray-500 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor={task._id} className="ml-3 text-light-2">
              {task.task}
            </label>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <label className="block text-light-1 mb-2">How do you feel after completing these tasks? (1-10)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={moodRating}
          onChange={(e) => setMoodRating(parseInt(e.target.value))}
          className="w-full h-2 bg-dark-4 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-light-2 text-sm mt-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
        <div className="text-center text-light-1 mt-2">
          Current rating: {moodRating}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="feedback" className="block text-light-1 mb-2">
          Any additional feedback?
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full p-3 bg-dark-3 border border-dark-4 rounded-lg text-light-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Share your thoughts on the tasks and how they affected you..."
        />
      </div>
      
      <button
        onClick={handleSubmitFeedback}
        disabled={isSubmitting}
        className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-light-1 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-light-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Feedback'
        )}
      </button>
    </div>
  );
}