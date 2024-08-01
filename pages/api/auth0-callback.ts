import { NextApiRequest, NextApiResponse } from 'next';
import { handleCallback } from '@auth0/nextjs-auth0';
import connectDB from '@/app/api/mongoose'; // Adjust the import path as necessary
import User from '@/app/api/models/User'; // Adjust the import path as necessary
import { v4 as uuidv4 } from 'uuid';

const auth0CallbackHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  try {
    // Handle the callback
    const { user } = await handleCallback(req, res);

    // Ensure the user property is correctly typed
    if (user) {
      const email = user.email as string;
      const name = user.name as string;
      const picture = user.picture as string;

      // Check if user exists in the database
      let dbUser = await User.findOne({ useremail: email });

      if (!dbUser) {
        // Create new user if not found
        dbUser = new User({
          uuid: uuidv4(),
          username: name || '',
          useremail: email || '',
          avatar: picture || '',
          // other fields with default or empty values
        });

        await dbUser.save();
      }

      // Redirect or handle response after saving/updating user
      res.redirect('/');
    } else {
      res.status(400).send('User not found');
    }
  } catch (error) {
    console.error('Error handling Auth0 callback:', error);
    res.status(500).send('Internal Server Error');
  }
};

export default auth0CallbackHandler;
