import connectDB from "@/app/api/mongoose";
import Event from "@/app/api/models/Event"; // Assuming you have an Event model

interface EventId {
    event_id: string;
}

async function fetchEventIds(): Promise<EventId[]> {
    await connectDB();
    const events = await Event.find({}, 'event_id').exec();
    return events.map(event => ({ event_id: event.event_id }));
}

export default fetchEventIds;
