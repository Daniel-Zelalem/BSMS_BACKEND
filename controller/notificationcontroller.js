const Notification = require("../models/Notification");
const { pusherServer } = require("../ChatPusher/pusher");
const cron = require("node-cron");

//Create new notifications
const sendPropertyAssignmentNotification = async (req, res) => {
  try {
    const { brokerEmail } = req.params;

    const notification = new Notification({
      userId: brokerEmail,
      title: "Property Assignment",
      message: `You have been assigned to a new property. \n(${new Date().toLocaleString()}) `,
      type: "info",
    });
    await notification.save();

    // Triggering Pusher event
    pusherServer.trigger("notifications", "new-notification", {
      title: "Property Assigned",
      message: `You have been assigned to a new property. \n(${new Date().toLocaleString()}) `,
      userId: brokerEmail,
    });
    res.json({
      success: true,
      message: "Notification sent to broker successfully",
    });
    // delete old notifications from the database after 7 days
    cron.schedule("0 0 * * *", async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
        await Notification.deleteMany({
          isRead: true,
          createdAt: { $lt: sevenDaysAgo },
        });
      } catch (error) {
        console.error("Error deleting old read notifications:", error);
      }
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notification" });
  }
};

const sendPropertyPostedNotification = async (req, res) => {
  try {
    const { uploadedBy } = req.params;
    const notification = new Notification({
      userId: uploadedBy,
      title: "Property Approved",
      message: `Congratulation. The property that you uploaded is Approved! \n(${new Date().toLocaleString()}) `,
      type: "info",
    });
    await notification.save();

    // Triggering Pusher event
    pusherServer.trigger("notifications", "new-notification", {
      title: "Property Approved",
      message: `Congratulation. The property that you uploaded is Approved! \n(${new Date().toLocaleString()}) `,
      userId: uploadedBy,
    });
    res.json({
      success: true,
      message: "Notification sent to user successfully",
    });
    // delete old notifications from the database after 7 days
    cron.schedule("0 0 * * *", async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
        await Notification.deleteMany({
          isRead: true,
          createdAt: { $lt: sevenDaysAgo },
        });
      } catch (error) {
        console.error("Error deleting old read notifications:", error);
      }
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notification" });
  }
};
const sendPropertyRegistrationNotification = async (req, res) => {
  try {
    const { brokerAdminRole } = req.params;

    const notification = new Notification({
      userId: brokerAdminRole,
      title: "Property Registered",
      message: `You have been Recived New Registered Property, please check and assign to a broker. \n(${new Date().toLocaleString()}) `,
      type: "info",
    });
    await notification.save();

    // Triggering Pusher event
    pusherServer.trigger("notifications", "new-notification", {
      title: "Property Registered",
      message: `You have been Recived New Registered Property, please assign to a broker. \n(${new Date().toLocaleString()}) `,
      userId: brokerAdminRole,
    });
    res.json({
      success: true,
      message: "Notification sent to manager successfully",
    });
    // delete old notifications from the database after 7 days
    cron.schedule("0 0 * * *", async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
        await Notification.deleteMany({
          isRead: true,
          createdAt: { $lt: sevenDaysAgo },
        });
      } catch (error) {
        console.error("Error deleting old read notifications:", error);
      }
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notification" });
  }
};

const sendPropertyRejectionNotification = async (req, res) => {
  try {
    const { uploadedBy } = req.params;

    console.log(uploadedBy);
    const notification = new Notification({
      userId: uploadedBy,
      title: "Property Rejected",
      message: `Sorry,The properity that You uploaded is rejected by Broker Manager. \n(${new Date().toLocaleString()}) `,
      type: "info",
    });
    await notification.save();

    // Triggering Pusher event
    pusherServer.trigger("notifications", "new-notification", {
      title: "Property Rejection",
      message: `You have been Recived New Registered Property, please assign to a broker. \n(${new Date().toLocaleString()}) `,
      userId: uploadedBy,
    });
    res.json({
      success: true,
      message: "Notification sent to manager successfully",
    });
    // delete old notifications from the database after 7 days
    cron.schedule("0 0 * * *", async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
        await Notification.deleteMany({
          isRead: true,
          createdAt: { $lt: sevenDaysAgo },
        });
      } catch (error) {
        console.error("Error deleting old read notifications:", error);
      }
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send notification" });
  }
};

//Fetch All Notification
const fetchAllNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      userId: userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .exec();

    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

//Mark Seen Notification as Read
const markAllSeenNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read" });
  }
};

module.exports = {
  sendPropertyAssignmentNotification,
  sendPropertyPostedNotification,
  sendPropertyRegistrationNotification,
  sendPropertyRejectionNotification,
  fetchAllNotification,
  markAllSeenNotificationAsRead,
};
