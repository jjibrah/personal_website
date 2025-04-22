import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Mock user (in production, this would be stored in the database)
const adminUser = {
  username: 'admin',
  password: '$2a$10$YourHashedPasswordHere' // Hashed password for 'admin123'
};

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check if username exists
    if (username !== adminUser.username) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: adminUser.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.post('/verify', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      res.json({ valid: true });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 