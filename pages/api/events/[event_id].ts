import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/app/api/mongoose';
import Event, { EventDocument } from '@/app/api/models/Event';
import { getSession } from '@auth0/nextjs-auth0';
import User from '@/app/api/models/User';  // Ensure User model is imported


export default async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB(); // Establish database connection
    // Set cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');


    const { method } = req;
    const eventId = req.query.event_id as string;
    const session = await getSession(req, res);

    if (!session || !session.user) {
        return res.status(401).json({ message: 'You must be logged in to perform this action' });
    }

    const userId = session.user.sub;

    switch (method) {
        case 'GET':
            try {
                const event = await Event.findOne({ event_id: eventId });
                if (!event) {
                    return res.status(404).json({ error: 'Event not found' });
                }
                res.status(200).json(event);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch event' });
            }
            break;
        case 'POST':
            // Handle adding an event to the user's dashboard
            try {
                const event = await Event.findOne({ event_id: eventId });
                if (!event) {
                    return res.status(404).json({ error: 'Event not found' });
                }

                // Add event to user's list
                const user = await User.findOne({ uuid: userId });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Assuming the user's events are stored as an array of event IDs
                if (!user.events) {
                    user.events = [];
                }

                // Add event ID to user's events if not already present
                if (!user.events.includes(eventId)) {
                    user.events.push(eventId);
                }

                await user.save();
                res.status(200).json({ message: 'Event added to user dashboard' });
            } catch (error) {
                res.status(500).json({ error: 'Failed to add event to user dashboard' });
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
        case 'PATCH':
            try {
                const { addedByUser } = req.body; // Extract the patch fields from request body

                // Partial update of the event
                const updatedEvent = await Event.findOneAndUpdate(
                    { event_id: eventId },
                    { $set: { addedByUser } }, // Use $set to update specific fields
                    { new: true }
                );

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
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
};
