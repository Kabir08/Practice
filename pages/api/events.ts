import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/app/api/mongoose';
import Event from '@/app/api/models/Event';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB(); // Establish database connection

    const { method } = req;
    const eventId = req.query.eventId as string;

    switch (method) {
        case 'GET':
            try {
                if (eventId) {
                    const event = await Event.findOne({ event_id: eventId });
                    if (!event) {
                        return res.status(404).json({ error: 'Event not found' });
                    }
                    res.status(200).json(event);
                } else {
                    const events = await Event.find({});
                    res.status(200).json(events);
                }
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch events' });
            }
            break;
        case 'POST':
            try {
                const event = new Event(req.body);
                await event.save();
                res.status(201).json(event);
            } catch (error) {
                res.status(500).json({ error: 'Failed to save event' });
            }
            break;
        case 'PUT':
            try {
                const updatedEvent = await Event.findOneAndUpdate({ event_id: eventId }, req.body, { new: true });
                if (!updatedEvent) {
                    return res.status(404).json({ error: 'Event not found' });
                }
                res.status(200).json(updatedEvent);
            } catch (error) {
                res.status(500).json({ error: 'Failed to update event' });
            }
            break;
        case 'DELETE':
            try {
                const deletedEvent = await Event.findOneAndDelete({ event_id: eventId });
                if (!deletedEvent) {
                    return res.status(404).json({ error: 'Event not found' });
                }
                res.status(200).json({ message: 'Event deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to delete event' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
};
