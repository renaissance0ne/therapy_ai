import mongoose from 'mongoose';

let User;

try {
  User = mongoose.model('User');
} catch {
  const UserSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    profileImage: { type: String },
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
    createdAt: { type: Date, default: Date.now }
  });

  User = mongoose.model('User', UserSchema);
}

export default User;