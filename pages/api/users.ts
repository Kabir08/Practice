import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/app/api/mongoose';
import User from '@/app/api/models/User';
import { v4 as uuidv4 } from 'uuid';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { username, useremail, avatar, paymentId, paymentSecret, instagram, x } = req.body;

        let user = await User.findOne({ useremail });

        if (user) {
          user.username = username;
          user.avatar = avatar;
          user.paymentId = paymentId;
          user.paymentSecret = paymentSecret;
          user.instagram = instagram;
          user.x = x;
        } else {
          user = new User({
            uuid: uuidv4(),
            username,
            useremail,
            avatar,
            paymentId,
            paymentSecret,
            instagram,
            x,
          });
        }

        await user.save();

        res.status(201).json({ message: 'User created/updated', user });
      } catch (error) {
        console.error('Error creating/updating user:', error);
        res.status(500).json({ error: 'Failed to create/update user' });
      }
      break;

    case 'PATCH':
      try {
        const { uuid, username, avatar, paymentId, paymentSecret, instagram, x } = req.body;

        if (!uuid) {
          return res.status(400).json({ error: 'UUID is required for updates' });
        }

        const updatedUser = await User.findOneAndUpdate(
          { uuid },
          { username, avatar, paymentId, paymentSecret, instagram, x },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated', updatedUser });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
      }
      break;

    case 'GET':
      try {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
          return res.status(400).json({ error: 'Email query parameter is required' });
        }

        const user = await User.findOne({ useremail: email });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST', 'PATCH', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};
