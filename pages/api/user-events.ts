import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/app/api/mongoose';
import Event from '@/app/api/models/Event';
import { getSession } from '@auth0/nextjs-auth0';

const userEventsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectDB(); // Establish database connection

    const { method } = req;
    const session = await getSession(req, res);

    if (!session || !session.user) {
        return res.status(401).json({ message: 'You must be logged in to perform this action' });
    }

    const userId = session.user.sub;

    switch (method) {
        case 'GET':
            try {
                const events = await Event.find({ user_id: userId });
                res.status(200).json(events);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch events' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
};

export default userEventsHandler;
