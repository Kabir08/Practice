import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/app/api/mongoose';
import Event, { EventDocument } from '@/app/api/models/Event';
import { v4 as uuidv4 } from 'uuid';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const events = await Event.find({});
            res.status(200).json(events);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    } else if (req.method === 'POST') {
        try {
            // Generate UUID for the new event
            const eventId = uuidv4();
            const event = new Event({ ...req.body, _id: eventId } as EventDocument); // Ensure to cast req.body as EventDocument
            await event.save();
            res.status(201).json(event);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to save event' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updateData } = req.body;
            const event = await Event.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).json(event);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update event' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            await Event.findByIdAndDelete(id);
            res.status(200).json({ message: 'Event deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete event' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};
