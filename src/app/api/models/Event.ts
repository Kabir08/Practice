import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface EventDocument extends Document {
    event_id: string;
    eventName: string;
    eventLocation: string;
    eventExpiry: Date;
    eventDescription: string;
    eventColor: string;
    creatorName: string; 
    user_id: string; 
}

export interface EventModel extends mongoose.Model<EventDocument> {}

const EventSchema: Schema<EventDocument> = new Schema({
    event_id: { type: String, default: () => uuidv4() },
    eventName: { type: String, required: true },
    eventLocation: { type: String, required: true },
    eventExpiry: { type: Date, required: true },
    eventDescription: { type: String, required: true },
    eventColor: { type: String, required: true },
    creatorName: { type: String, required: true }, // Add creator's name field
    user_id: { type: String, required: true },
});

const Event = mongoose.models.Event as EventModel || mongoose.model<EventDocument, EventModel>('Event', EventSchema);

export default Event;
