import mongoose from 'mongoose';

let Session;

try {
  // Try to get the existing model to prevent OverwriteModelError
  Session = mongoose.model('Session');
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

  Session = mongoose.model('Session', SessionSchema);
}

export default Session;