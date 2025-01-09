import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import routes
import signupRoutes from './api/signup.js';
import signinRoutes from './api/signin.js';
import protectedRoutes from './api/protected.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set up PORT from environment variables or use 3000 as default
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Middleware for parsing JSON
app.use(express.json());

// Use the imported route handlers
app.use('/api/signup', signupRoutes);
app.use('/api/signin', signinRoutes);
app.use('/api/protected', protectedRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
