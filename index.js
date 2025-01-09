import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import signupRoutes from './api/signup.js';
import signinRoutes from './api/signin.js';
import protectedRoutes from './api/protected.js';
import compression from 'compression';

dotenv.config();

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection (optimized for serverless)
const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return; // Already connected
  }

  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Middleware for parsing JSON
app.use(express.json());

// Use compression middleware for response optimization
app.use(compression());

// Use the imported route handlers
app.use('/api/signup', signupRoutes);
app.use('/api/signin', signinRoutes);
app.use('/api/protected', protectedRoutes);

// Export the app for serverless environments (like Vercel)
export default app;
