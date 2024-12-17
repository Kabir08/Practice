import mongoose from 'mongoose';

const connectDB = async () => {
  // Check if there's already a connection to avoid re-connecting
  if (mongoose.connections[0].readyState) {
    return; // If already connected, do nothing
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MongoDB URI is not defined in environment variables");
  }

  try {
    const db = await mongoose.connect(mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Database connection failed');
  }
};

export default connectDB;
