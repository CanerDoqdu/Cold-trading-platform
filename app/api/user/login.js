import connectToDatabase from '../../../lib/dbConnect'; // MongoDB bağlantısı
import User from '../../../models/userModel'; // Model dosya yolunu kontrol edin
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// Token oluştur
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      console.error('Email or password missing.');
      return res.status(400).json({ error: 'All fields must be filled.' });
    }

    try {
      await connectToDatabase(); // MongoDB bağlantısını başlat
      const user = await User.login(email, password);

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials.' });
      }

      // Token oluştur
      const token = createToken(user._id);
      if (!token) throw new Error('Token creation failed.');

      // Çerezi ayarla
      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Üretim ortamında güvenli çerezler
        maxAge: 3 * 24 * 60 * 60,
        path: '/',
      }));

      console.log('Login successful, cookie set.');
      return res.status(200).json({ _id: user._id, email: user.email });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
