import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the document (instance) of the Event model
export interface EventDocument extends Document {
    eventName: string;
    eventLocation: string;
    eventExpiry: Date;
    eventDescription: string;
    eventColor: string;
}

// Define the interface for the Event model itself
export interface EventModel extends mongoose.Model<EventDocument> {}

// Define the schema for the Event model
const EventSchema: Schema<EventDocument> = new Schema({
    eventName: { type: String, required: true },
    eventLocation: { type: String, required: true },
    eventExpiry: { type: Date, required: true },
    eventDescription: { type: String, required: true },
    eventColor: { type: String, required: true },
});

// Define and export the Event model using the schema and interfaces
const Event = mongoose.models.Event as EventModel || mongoose.model<EventDocument, EventModel>('Event', EventSchema);

export default Event;
