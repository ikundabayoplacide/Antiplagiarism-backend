const { Notification } = require('../src/database/modals/index');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.update({ read: true }, { where: { userId: req.user.id } });
    } else {
      const n = await Notification.findOne({ where: { id, userId: req.user.id } });
      if (!n) return res.status(404).json({ message: 'Notification not found' });
      await n.update({ read: true });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, markAsRead };
