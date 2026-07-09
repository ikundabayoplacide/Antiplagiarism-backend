const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');
const { User, Settings } = require('../src/database/modals/index');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phoneNumber: user.phoneNumber || null, department: user.department || null },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

const register = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber, department } = req.body;
    if (!fullName) return res.status(400).json({ field: 'fullName', message: 'Full name is required' });
    if (!email) return res.status(400).json({ field: 'email', message: 'Email is required' });
    if (!password) return res.status(400).json({ field: 'password', message: 'Password is required' });
    if (!role) return res.status(400).json({ field: 'role', message: 'Role is required' });
    if (role === 'student' && !department)
      return res.status(400).json({ field: 'department', message: 'Department is required for students' });

    const validRoles = ['student', 'lecturer', 'admin'];
    if (!validRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ field: 'email', message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role, phoneNumber: phoneNumber || null, department: department || null });

    await Settings.create({
      userId: user.id,
      fullName,
      email,
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, phoneNumber: user.phoneNumber, department: user.department || null },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ field: 'email', message: 'Email is required' });
    if (!password) return res.status(400).json({ field: 'password', message: 'Password is required' });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ field: 'email', message: 'No account found with this email' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ field: 'password', message: 'Incorrect password' });

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
