import mongoose, { Model } from 'mongoose';
import { ISession } from "./sessionTypes";

let Session: Model<ISession>;

try {
  // Try to get the existing model to prevent OverwriteModelError
  Session = mongoose.model('Session') as Model<ISession>;
} catch {
  // Define the schema if the model doesn't exist
  const SessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    completed: { type: Boolean, default: false },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    todoList: [
      {
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    moodBefore: { type: Number },
    moodAfter: { type: Number },
    feedback: { type: String }
  });

  Session = mongoose.model<ISession>('Session', SessionSchema);
}

export default Session;