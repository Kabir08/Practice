import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { getSession } from '@auth0/nextjs-auth0';
import User, { IUser } from '@/app/api/models/User'; // Import IUser as a named export

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = session.user;
    const { uuid, email } = req.query; // Extract uuid and email from query parameters

    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI || '');
      }

      let userData: IUser | null = null;

      if (uuid) {
        userData = await User.findOne({ uuid }).select('-paymentId -paymentSecret') as IUser;
      } else if (email) {
        userData = await User.findOne({ email: decodeURIComponent(email as string) }).select('-paymentId -paymentSecret') as IUser;
      } else {
        return res.status(400).json({ error: 'Bad Request: uuid or email is required' });
      }

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
