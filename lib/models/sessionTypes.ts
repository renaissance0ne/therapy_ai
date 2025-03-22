// lib/models/sessionTypes.ts
export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ITodoItem {
  task: string;
  completed: boolean;
  createdAt: Date;
}

export interface ISession {
  _id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  messages: IMessage[];
  todoList: ITodoItem[];
  moodBefore?: number;
  moodAfter?: number;
  feedback?: string;
}