import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const uri = process.env.MONGODB_URI;
mongoose.connect(uri).catch((error) => console.error('MongoDB connection error:', error));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const AppUser = mongoose.models.AppUser || mongoose.model('AppUser', userSchema);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await body('username').isLength({ min: 5 }).withMessage('Username should be at least 5 characters long').run(req);
    await body('email').isEmail().withMessage('Invalid email address').run(req);
    await body('password').isLength({ min: 5 }).withMessage('Password should be at least 5 characters long').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await AppUser.findOne({ email });
      if (existingUser) {
        return res.status(400).send('Email is already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new AppUser({ username, email, password: hashedPassword });
      await user.save();
      res.status(201).send('User registered successfully!');
    } catch (error) {
      res.status(500).send('Error registering user');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
