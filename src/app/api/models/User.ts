import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  uuid: string;
  username: string;
  useremail:string;
  avatar: string;
  paymentId: string;
  paymentSecret: string;
  instagram: string;
  x: string; // Rename this if needed, but ensure consistency
  events: string[]; // Array to track added events
}

const userSchema: Schema<IUser> = new Schema({
  uuid: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  useremail: { type: String, required: true, unique: true },
  avatar: { type: String },
  paymentId: { type: String },
  paymentSecret: { type: String },
  instagram: { type: String },
  x: { type: String },
  events: [{ type: String }], // Track added events
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
