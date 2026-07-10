const Notification = require("../models/notification.model");

// CREATE Notification
exports.createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ All Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      tenantId: req.tenantId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// exports.getNotifications = async (req, res) => {
//   try {
//     // Set SSE headers
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");
//     res.flushHeaders(); // send headers immediately

//     // Send existing notifications as initial events
//     const notifications = await Notification.find().sort({ createdAt: -1 });
//     notifications.forEach((notif) => {
//       res.write(`id: ${notif._id}\n`);
//       res.write(`event: notification\n`);
//       res.write(`data: ${JSON.stringify(notif)}\n\n`);
//     });

//     // Example: push new notifications every few seconds
//     const interval = setInterval(async () => {
//       const latest = await Notification.find().sort({ createdAt: -1 }).limit(1);
//       if (latest.length > 0) {
//         const notif = latest[0];
//         res.write(`id: ${notif._id}\n`);
//         res.write(`event: notification\n`);
//         res.write(`data: ${JSON.stringify(notif)}\n\n`);
//       }
//     }, 5000);

//     // Handle client disconnect
//     req.on("close", () => {
//       clearInterval(interval);
//       res.end();
//     });
//   } catch (err) {
//     res.write(`event: error\n`);
//     res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
//     res.end();
//   }
// };

// READ Single Notification
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE Notification (e.g. mark as read)
exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE Notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
