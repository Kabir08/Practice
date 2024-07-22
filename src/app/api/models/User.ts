import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  username: string;
  avatar: string;
  paymentId: string;
  paymentSecret: string;
  instagram: string;
  X: string; // Rename this if needed, but ensure consistency
}

const userSchema: Schema<IUser> = new Schema({
  auth0Id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  paymentId: { type: String },
  paymentSecret: { type: String },
  instagram: { type: String },
  X: { type: String },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
