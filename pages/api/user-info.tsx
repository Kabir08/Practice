// pages/api/user-info.ts
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import connectDB from '@/app/api/mongoose';
import User from '@/app/api/models/User';
import { NextApiRequest, NextApiResponse } from 'next';

export default withApiAuthRequired(async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    const session = await getSession(req, res);
    const user = session?.user;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const dbUser = await User.findOne({ username: user.nickname });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});
