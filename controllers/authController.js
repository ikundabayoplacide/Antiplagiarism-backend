const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');
const { User, Settings } = require('../src/database/modals/index');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, phoneNumber: user.phoneNumber || null },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

const register = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;
    if (!fullName || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const validRoles = ['student', 'lecturer', 'admin'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role, phoneNumber: phoneNumber || null });

    const nameParts = fullName.split(' ');
    await Settings.create({
      userId: user.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email,
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phoneNumber: user.phoneNumber },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phoneNumber: user.phoneNumber },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };
