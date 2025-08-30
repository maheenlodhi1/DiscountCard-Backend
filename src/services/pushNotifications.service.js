const admin = require("firebase-admin");
const serviceAccount = require("../../secrets/kafu-card-firebasesecrets.json");
const { FirebaseTokens } = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (token, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sendBroadcastNotifications = async (tokens, title, body) => {
  const message = {
    tokens, // Array of tokens
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(
      "Broadcast sent successfully:",
      response.successCount,
      "messages sent"
    );
  } catch (error) {
    console.error("Error broadcasting notifications:", error);
  }
};

const getUserTokens = async (userType) => {
  const tokens = await FirebaseTokens.find({ userType });
  if (!Array.isArray(tokens)) {
    throw new ApiError(httpStatus.NOT_FOUND, "Unable to fetch the user tokens");
  }
  return tokens;
};

module.exports = {
  sendNotification,
  sendBroadcastNotifications,
  getUserTokens,
};
