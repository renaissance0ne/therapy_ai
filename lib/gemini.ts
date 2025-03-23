// In your Gemini API wrapper file
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import Session from './models/session';
import DOMPurify from 'dompurify';

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
    const responseText = result.response.text();
    return formatGeminiResponse(responseText);
  } catch (error: any) {
    console.error("Error sending message to Gemini:", error);
    
    // Better error handling with more details
    if (error.response) {
      console.error("API Response:", error.response);
    }
    
    return "I'm having trouble processing that. Could we try a different approach?";
  }
}

function formatGeminiResponse(content: string) {
  // Format bold text
  let processed = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Format italic text
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Format headings
  processed = processed.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold my-2">$1</h3>');
  processed = processed.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold my-2">$1</h2>');
  processed = processed.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold my-3">$1</h1>');
  
  // Format lists
  processed = processed.replace(/^\- (.*?)$/gm, '<li class="ml-4">$1</li>');
  processed = processed.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal">$1</li>');
  
  // Format links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" class="text-blue-400 underline" target="_blank">$1</a>');
  
  // Convert newlines to <br> tags
  processed = processed.replace(/\n\n/g, '<br><br>');
  processed = processed.replace(/\n/g, '<br>');
  
  return processed;
}

export async function generateTodoList(chat: ChatSession, messages: any[], previousTodos: string[] = []) {
  try {
    // Create a simplified summary of the conversation for context
    const conversationSummary = messages
      .filter(msg => msg.role === 'user')
      .slice(-5)  // Take last 5 user messages for context
      .map(msg => msg.content)
      .join(' ');
    
    let prompt = `Create a TODO LIST with exactly 3-5 specific, actionable tasks based on this conversation summary: "${conversationSummary}"

IMPORTANT:
- START IMMEDIATELY with "1." for the first task
- ONLY provide numbered tasks (1., 2., 3., etc.)
- DO NOT include any introduction, questions, or explanations
- Each task must be practical and relate to mental wellbeing

Previous incomplete tasks: ${previousTodos.join(', ')}`;
    
    console.log("Sending todo generation prompt:", prompt); // For debugging
    
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();
    
    console.log("Raw todo response:", response); // For debugging
    
    // If response doesn't contain any numbered items, return default items
    if (!response.match(/\d+\./)) {
      console.log("No numbered items found in response, using defaults");
      return "1. Take a 15-minute walk outside\n2. Practice deep breathing for 5 minutes\n3. Write down three things you're grateful for";
    }
    
    return formatGeminiResponse(response);
  } catch (error) {
    console.error("Error generating todo list:", error);
    return "1. Take a 15-minute walk outside\n2. Practice deep breathing for 5 minutes\n3. Write down three things you're grateful for";
  }
}

export async function processFeedback(chat: ChatSession, completedTasks: string[], moodRating: number) {
  try {
    const tasksInfo = completedTasks.length > 0 
      ? `The user has completed these tasks: ${completedTasks.join(', ')}` 
      : `The user hasn't completed any tasks yet`;
      
    const prompt = `${tasksInfo} and rated their mood as ${moodRating}/10. Based on this feedback, what insights can you provide about which activities were most beneficial and how we might adjust future recommendations?`;
    
    const result = await chat.sendMessage(prompt);
    return formatGeminiResponse(result.response.text());
  } catch (error: any) {
    console.error("Error processing feedback:", error);
    return "I couldn't process your feedback. Let's discuss directly what worked well for you.";
  }
}

