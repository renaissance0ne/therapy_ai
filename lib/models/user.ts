import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for User document
interface IUser extends Document {
  clerkId: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  sessions: mongoose.Types.ObjectId[];
  createdAt: Date;
}

// Define a variable to hold the model
let User: Model<IUser>;

try {
  // Try to retrieve the existing model
  User = mongoose.model<IUser>('User');
} catch {
  // Create the schema if the model doesn't exist
  const UserSchema = new Schema<IUser>({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    profileImage: { type: String },
    sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
    createdAt: { type: Date, default: Date.now }
  });

  // Create and register the model
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;