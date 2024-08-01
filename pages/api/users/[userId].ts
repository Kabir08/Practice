import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/app/api/models/User';  // Adjust the path as necessary
import connectDB from '@/app/api/mongoose';

// Disable Next.js body parsing to use multer
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set a limit to handle large base64 data
    },
  },
};

// Define an interface for the PATCH request body to provide type safety
interface PatchRequestBody {
  uuid: string;
  username?: string;
  avatar?: string;  // Base64 encoded avatar
  paymentId?: string;
  paymentSecret?: string;
  instagram?: string;
  x?: string;
  eventId?: string;
  action?: 'add' | 'remove';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (typeof userId !== 'string') {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const user = await User.findOne({ uuid: userId });
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
      }
      break;

    case 'PATCH':
      try {
        // Explicitly type request body
        const { uuid, username, avatar, paymentId, paymentSecret, instagram, x, eventId, action } = req.body as PatchRequestBody;

        if (!uuid) {
          return res.status(400).json({ error: 'UUID is required for updates' });
        }

        const userUpdate: any = {};

        if (username) userUpdate.username = username;
        if (avatar) userUpdate.avatar = avatar;  // Base64 avatar
        if (paymentId) userUpdate.paymentId = paymentId;
        if (paymentSecret) userUpdate.paymentSecret = paymentSecret;
        if (instagram) userUpdate.instagram = instagram;
        if (x) userUpdate.x = x;

        // Handle events updates
        if (eventId && action) {
          const user = await User.findOne({ uuid });
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }

          if (action === 'add') {
            if (!user.events.includes(eventId)) {
              user.events.push(eventId);
            }
          } else if (action === 'remove') {
            user.events = user.events.filter((id: string) => id !== eventId);
          } else {
            return res.status(400).json({ error: 'Invalid action' });
          }

          await user.save();
          res.status(200).json({ message: 'User events updated', user });
          return;
        }

        // Perform the update operation
        const updatedUser = await User.findOneAndUpdate(
          { uuid },
          userUpdate,
          { new: true, runValidators: true }
        );
        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User updated', updatedUser });
      } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ error: `Failed to update user: ${error.message}` });
        } else {
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
      }
      break;

    case 'POST':
      try {
        // Since we're not handling file uploads, remove multer and related code
        const { uuid, username, avatar, paymentId, paymentSecret, instagram, x } = req.body as PatchRequestBody;

        // Check if the user already exists
        const existingUser = await User.findOne({ uuid });
        if (existingUser) {
          res.status(400).json({ error: 'User already exists' });
          return;
        }

        // Create a new user
        const newUser = new User({
          uuid,
          username,
          paymentId,
          paymentSecret,
          instagram,
          x,
          avatar, // Base64 avatar
          events: [], // Initialize events as an empty array
        });

        await newUser.save();
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
      }
      break;

    case 'DELETE':
      try {
        const deletedUser = await User.findOneAndDelete({ uuid: userId });
        if (deletedUser) {
          res.status(200).json({ message: 'User deleted successfully' });
        } else {
          res.status(404).json({ error: 'User not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
