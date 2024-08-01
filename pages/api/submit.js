import mongoose from 'mongoose';
import multer from 'multer';
import { getSession } from '@auth0/nextjs-auth0';
import User from '@/app/api/models/User';

// Set up multer for file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadMiddleware = upload.single('avatar');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return new Promise((resolve, reject) => {
      uploadMiddleware(req, res, async (err) => {
        console.log('Starting multer middleware...');
        if (err) {
          console.error('Multer error:', err);
          res.status(500).json({ error: 'Multer error: ' + err.message });
          return reject(err);
        }

        console.log('Multer middleware completed. File:', req.file);
        console.log('Uploaded file:', req.file);
        console.log('Form data:', req.body);

        const session = await getSession(req, res);
        if (!session || !session.user) {
          res.status(401).json({ error: 'Unauthorized' });
          return reject('Unauthorized');
        }

        const user = session.user;

        try {
          const {
            username,
            paymentId,
            paymentSecret,
            instagram,
            X,
          } = req.body;

          const avatar = req.file ? req.file.buffer.toString('base64') : null;

          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI || '');
          }

          const newUser = new User({
            uuid: user.sub,
            username,
            avatar,
            paymentId,
            paymentSecret,
            instagram,
            X,
          });

          await newUser.save();

          res.status(201).json({ message: 'User data saved successfully.' });
          resolve();
        } catch (error) {
          console.error('Error saving user:', error);
          res.status(500).json({ error: 'Failed to save user data.' });
          reject(error);
        }
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
