const { Settings } = require('../src/database/modals/index');

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

module.exports = { getSettings, updateSettings };
