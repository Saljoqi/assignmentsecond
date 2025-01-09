import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
    const { email, password } = req.body;

    try {
      const user = await AppUser.findOne({ email });
      if (!user) {
        return res.status(404).send('User not found');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Invalid password');
      }

      const token = jwt.sign({ email: user.email, username: user.username }, JWT_SECRET, {
        expiresIn: '1h',
      });

      res.status(200).json({ message: 'Sign-In successful!', token });
    } catch (error) {
      res.status(500).send('Error signing in');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
