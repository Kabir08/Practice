// Import required modules
import express from 'express';
import next from 'next';
import mongoose from 'mongoose';
import multer from 'multer';
import { getSession } from '@auth0/nextjs-auth0';

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize Express
const server = express();

// Set up multer for file handling
const upload = multer({ storage: multer.memoryStorage() });

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Define API routes
server.post('/api/submit', upload.single('avatar'), async (req, res) => {
  console.log('Received request:', req.method, req.body);

  const session = await getSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = session.user;

  try {
    const {
      username,
      paymentId,
      paymentSecret,
      instagram,
      linkedin,
      github
    } = req.body;

    const avatar = req.file ? req.file.buffer.toString('base64') : null; // Store avatar as base64 string

    // Save user data to MongoDB
    // const newUser = new User({
    //   auth0Id: user.sub,
    //   username,
    //   avatar,
    //   paymentId,
    //   paymentSecret,
    //   instagram,
    //   linkedin,
    //   github,
    // });
    // await newUser.save();

    res.status(201).json({ message: 'User data saved successfully.' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Failed to save user data.' });
  }
});

// Handle all other requests through Next.js
server.all('*', (req, res) => {
  return handle(req, res);
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 3000, () => {
      console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
