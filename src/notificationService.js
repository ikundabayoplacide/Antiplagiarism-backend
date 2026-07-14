const { Notification } = require('./database/modals/index');

/**
 * Create notifications for one or more users.
 * @param {string[]} userIds
 * @param {'assignment'|'plagiarism'|'submission'} type
 * @param {string} title
 * @param {string} message
 */
const notify = async (userIds, type, title, message) => {
  const records = userIds.map((userId) => ({ userId, type, title, message }));
  await Notification.bulkCreate(records);
};

module.exports = { notify };
