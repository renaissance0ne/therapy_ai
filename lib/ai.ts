import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

type ChatSession = ReturnType<GenerativeModel['startChat']>;

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function initTherapySession(userContext: Record<string, unknown> = {}): Promise<ChatSession> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    
    const systemPrompt = `You are therapyAI, a compassionate and insightful AI therapist. 
    Your goal is to create a safe space for the user to express their thoughts and feelings.
    Ask open-ended questions, practice active listening, and show empathy.
    Avoid giving medical diagnoses or prescribing medication.
    Focus on understanding the user's situation, providing support, and suggesting healthy coping strategies.
    At the end of the session, you'll create a personalized todo list with 3-5 actionable items that could help improve their mental wellbeing.`;
    
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'I would like to start a therapy session.' }],
        },
        {
          role: 'model',
          parts: [{ text: "Hello! I'm therapyAI, and I'm here to provide a supportive space for you to talk about what's on your mind. How are you feeling today, and what brings you to this session?" }],
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

export async function sendMessageToGemini(chat: ChatSession, message: string): Promise<string> {
  try {
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    
    if (error instanceof Error && 'response' in error) {
      console.error("API Response:", error.response);
    }
    
    return "I'm having trouble processing that. Could we try a different approach?";
  }
}

export async function generateTodoList(chat: ChatSession, messages: unknown[]): Promise<string> {
  try {
    const prompt = `Based on our conversation, please generate a personalized todo list with 3-5 actionable items that could help improve the user's mental wellbeing. Each item should be specific, achievable, and relevant to what we've discussed.`;
    
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating todo list:", error);
    return "I couldn't generate a todo list. Please try again later.";
  }
}

export async function processFeedback(
  chat: ChatSession,
  completedTasks: string[],
  moodRating: number
): Promise<string> {
  try {
    const tasksInfo = completedTasks.length > 0 
      ? `The user has completed these tasks: ${completedTasks.join(', ')}` 
      : `The user hasn't completed any tasks yet`;
      
    const prompt = `${tasksInfo} and rated their mood as ${moodRating}/10. Based on this feedback, what insights can you provide about which activities were most beneficial and how we might adjust future recommendations?`;
    
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error processing feedback:", error);
    return "I couldn't process your feedback. Let's discuss directly what worked well for you.";
  }
}