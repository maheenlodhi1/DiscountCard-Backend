const cron = require("cron");
const { customerServices, emailService } = require("../services");
const getLogger = require("../config/logger");
const logger = getLogger("JOB BuyMembership");

const job = new cron.CronJob(
  "0 0 * * *",
  async () => {
    logger.info("****----Job for sending Reminder Email started----****");
    const users = await customerServices.getUsersForMembershipReminder();
    const sendEmailPromises = users.map(async (user) => {
      try {
        await emailService.sendCompleteProfileNotification(user.email);
        logger.info(`Email successfully sent to ${user.email}`);
        user.lastReminderSentAt = new Date();
        await user.save();
        return { email: user.email, status: "Sent" };
      } catch (error) {
        logger.error(`Failed to send email to ${user.email}:`, error);
        return { email: user.email, status: "Failed", error: error.message };
      }
    });
    try {
      if (users.length > 0) {
        const results = await Promise.all(sendEmailPromises);
        logger.info("Emails have been sent successful!");
      } else {
        logger.info("No users found to send email");
      }
    } catch (error) {
      logger.info("Error while sending the email", error);
    }
    logger.info("****----Job completed successfully!----****");
  },
  null,
  true,
  "Asia/Karachi"
);

job.start();
