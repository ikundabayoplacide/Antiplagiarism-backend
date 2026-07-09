const bcrypt = require('bcryptjs');
const { Settings, User } = require('../src/database/modals/index');

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { userId: req.user.id } });
    if (!settings)
      return res.status(404).json({ message: 'Settings not found' });

    res.json({
      fullName: settings.fullName,
      email: settings.email,
      emailNotifications: settings.emailNotifications,
      plagiarismAlerts: settings.plagiarismAlerts,
      similarityThreshold: settings.similarityThreshold,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { fullName, email, emailNotifications, plagiarismAlerts, similarityThreshold } = req.body;

    const [updated] = await Settings.update(
      { fullName, email, emailNotifications, plagiarismAlerts, similarityThreshold },
      { where: { userId: req.user.id } }
    );

    if (!updated)
      return res.status(404).json({ message: 'Settings not found' });

    const settings = await Settings.findOne({ where: { userId: req.user.id } });
    res.json({
      fullName: settings.fullName,
      email: settings.email,
      emailNotifications: settings.emailNotifications,
      plagiarismAlerts: settings.plagiarismAlerts,
      similarityThreshold: settings.similarityThreshold,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName && !email)
      return res.status(400).json({ message: 'Provide at least fullName or email' });

    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== req.user.id)
        return res.status(409).json({ field: 'email', message: 'Email already in use' });
    }

    await User.update(
      { ...(fullName && { fullName }), ...(email && { email }) },
      { where: { id: req.user.id } }
    );

    await Settings.update(
      { ...(fullName && { fullName }), ...(email && { email }) },
      { where: { userId: req.user.id } }
    );

    const user = await User.findByPk(req.user.id, { attributes: ['id', 'fullName', 'email', 'role'] });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ field: 'newPassword', message: 'Password must be at least 6 characters' });

    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(401).json({ field: 'currentPassword', message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update({ password: hashed }, { where: { id: req.user.id } });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettings, updateSettings, updateProfile, changePassword };
