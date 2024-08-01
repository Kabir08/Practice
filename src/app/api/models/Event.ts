import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface EventDocument extends Document {
    event_id: string;
    eventName: string;
    eventLocation: string;
    eventExpiry: Date;
    eventDescription: string;
    creatorName: string; 
    user_id: string; 
    likes: number;
    isAdded: boolean;
    addedByUsers: string[]; // Array to track user IDs who have added the event

}

export interface EventModel extends mongoose.Model<EventDocument> {}

const EventSchema: Schema<EventDocument> = new Schema({
    event_id: { type: String, default: () => uuidv4() },
    eventName: { type: String, required: true },
    eventLocation: { type: String, required: true },
    eventExpiry: { type: Date, required: true },
    eventDescription: { type: String, required: true },
    creatorName: { type: String, required: true },
    user_id: { type: String, required: true },
    likes: { type: Number, default: 0 },
    isAdded: { type: Boolean, default: false },
    addedByUsers: [{ type: String }], // Track user IDs who have added the event
});

const Event = mongoose.models.Event as EventModel || mongoose.model<EventDocument, EventModel>('Event', EventSchema);

export default Event;
