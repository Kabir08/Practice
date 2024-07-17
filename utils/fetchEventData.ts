import connectDB from "@/app/api/mongoose";
import Event from "@/app/api/models/Event";// Assuming you have an Event model

interface EventData {
    _id: string;
    event_id: string;
    eventName: string;
    eventLocation: string;
    eventExpiry: string;
    eventDescription: string;
    eventColor: string;
    __v: number;
}

async function fetchEventData(eventId: string): Promise<EventData | null> {
    await connectDB();
    const event = await Event.findOne({ event_id: eventId }).exec();
    return event ? event.toObject() : null;
}

export default fetchEventData;
