import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import Session from './models/session';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define the ChatSession type properly
type ChatSession = Awaited<ReturnType<GenerativeModel['startChat']>>;

export async function initTherapySession(userId: string) {
  try {
    // Check for previous sessions with incomplete todos
    const previousSessions = await Session.find({
      userId,
      completed: true,
      'todoList.completed': false
    }).sort({ endTime: -1 }).limit(1);
    
    const hasPreviousTodos = previousSessions.length > 0;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    
    let initialMessage = "Hello! I'm therapyAI, and I'm here to provide a supportive space for you to talk about what's on your mind. How are you feeling today, and what brings you to this session?";
    
    if (hasPreviousTodos) {
      const previousTodos = previousSessions[0].todoList
        .filter((todo: { completed: any; }) => !todo.completed)
        .map((todo: { task: any; }) => todo.task);
      
      initialMessage = `Welcome back! In our last session, I suggested these tasks: ${previousTodos.join(', ')}. Have you had a chance to complete any of them? How did they impact your mental state?`;
    }
    
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'I would like to start a therapy session.' }],
        },
        {
          role: 'model',
          parts: [{ text: initialMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    return chat;
  } catch (error) {
    console.error("Error initializing Gemini session:", error);
    throw new Error("Failed to initialize AI session. Please check your API configuration.");
  }
}

export async function sendMessageToGemini(chat: ChatSession, message: string) {
  try {
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error: any) {
    console.error("Error sending message to Gemini:", error);
    
    // Better error handling with more details
    if (error.response) {
      console.error("API Response:", error.response);
    }
    
    return "I'm having trouble processing that. Could we try a different approach?";
  }
}

export async function generateTodoList(chat: ChatSession, messages: any[], previousTodos: string[] = []) {
  try {
    let prompt = `Based on our conversation, please generate a personalized todo list with 3-5 actionable items that could help improve the user's mental wellbeing. Each item should be specific, achievable, and relevant to what we've discussed.`;
    
    if (previousTodos.length > 0) {
      prompt += ` Consider these previous incomplete todo items that may still be relevant: ${previousTodos.join(', ')}. You can include them if still applicable or create entirely new tasks based on today's session.`;
    }
    
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating todo list:", error);
    return "I couldn't generate a todo list. Please try again later.";
  }
}

export async function processFeedback(chat: ChatSession, completedTasks: string[], moodRating: number) {
  try {
    const tasksInfo = completedTasks.length > 0 
      ? `The user has completed these tasks: ${completedTasks.join(', ')}` 
      : `The user hasn't completed any tasks yet`;
      
    const prompt = `${tasksInfo} and rated their mood as ${moodRating}/10. Based on this feedback, what insights can you provide about which activities were most beneficial and how we might adjust future recommendations?`;
    
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Error processing feedback:", error);
    return "I couldn't process your feedback. Let's discuss directly what worked well for you.";
  }
}