const nodemailer = require("nodemailer");
const config = require("../config/config");
const getLogger = require("../config/logger");
const loadHtmlTemplate = require("../utils/LoadHtmlTemplate");
const transport = nodemailer.createTransport(config.email.smtp);
const moment = require("moment");

const logger = getLogger("EmailService");

/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html, from = config.email.from) => {
  const msg = { from, to, subject, html };
  await transport.sendMail(msg);
  return msg;
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, username, token) => {
  const subject = "Reset Password";
  const resetpasswordEmailUrl = `${config.clientUrl}auth/reset_password?token=${token}`;
  const placeholder = {
    username: username,
    verificationLink: resetpasswordEmailUrl,
  };
  const html = loadHtmlTemplate("forgotPasswordTemplate.html", placeholder);

  await sendEmail(to, subject, html);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (username, to, token) => {
  const subject = "Email Verification";
  const verificationEmailUrl = `${config.backendUrl}api/auth/verify-email?token=${token}`;
  const unsubscribeLink = `${config.clientUserUrl}unsubnewsletter`;

  const placeholder = {
    verificationLink: verificationEmailUrl,
    username: username,
    unsubscribeLink: unsubscribeLink,
  };
  const html = loadHtmlTemplate("emailVerificationTemplate.html", placeholder);
  await sendEmail(to, subject, html);
};

const sendEmailOnCreateUser = async (to) => {
  const subject = "New User Email Verification";
  const verificationEmailUrl = `link/verify-email`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};
const sendSignupInvitationEmail = async (to, group, token) => {
  const subject = "Signup invitation";
  const unsubscribeLink = `${config.clientUserUrl}unsubnewsletter`;
  const invitationEmailUrl = `${config.clientUrl}auth/signup?token=${token}&group=${group}`;
  const placeholder = {
    verificationLink: invitationEmailUrl,
    unsubscribeLink: unsubscribeLink,
  };
  const html = loadHtmlTemplate("signupInvitationTemplate.html", placeholder);

  await sendEmail(to, subject, html);
};
const sendChatLinkEmail = async (to, name, token) => {
  const subject = "Chat Receipt";
  const chatLink = `${config.clientUserUrl}?chatlink=${token}`;
  const unsubscribeLink = `${config.clientUserUrl}unsubnewsletter`;
  const placeholder = {
    username: name,
    verificationLink: chatLink,
    unsubscribeLink: unsubscribeLink,
  };
  const html = loadHtmlTemplate("chatLinkTemplate.html", placeholder);

  await sendEmail(to, subject, html);
};

const sendNewsLetterSubscribedEmail = async (to) => {
  const unsubscribeLink = `${config.clientUserUrl}unsubnewsletter`;
  const subject = "NewsLetter Subscription";
  const placeholder = {
    unsubscribeLink: unsubscribeLink,
  };
  const html = loadHtmlTemplate(
    "newsLetterSubscriptionTemplate.html",
    placeholder
  );
  await sendEmail(to, subject, html);
};
const sendNewsLetterSendEmailToAllSubscriptions = async (users, newsletter) => {
  const unsubscribeLink = `${config.clientUserUrl}unsubnewsletter`;
  const subject = "NewsLetter";
  const placeholder = {
    unsubscribeLink: unsubscribeLink,
    newsLetterTitle: newsletter.name,
    newsLetterImg: newsletter.logo,
    newsLetterContent: newsletter.description,
  };
  const html = loadHtmlTemplate("newsLetterSendTemplate.html", placeholder);
  const emailPromise = users.map((user) => {
    sendEmail(user.email, subject, html);
  });
  await Promise.all(emailPromise);
};

const sendVerificationOtpEmail = async (to, otp) => {
  const subject = "Your One-Time Password (OTP) for DiscountCard Registration";
  const supportEmail = config.email.support_email;
  const placeholder = { otp, supportEmail };
  const html = loadHtmlTemplate(
    "emailOptVerificationTemplate.html",
    placeholder
  );
  await sendEmail(to, subject, html);
};

const sendOfferCreationEmail = async (partner) => {
  const to = config.email.to;
  const subject = "New Offer Submitted for Approval";
  const placeholder = partner;
  const html = loadHtmlTemplate(
    "createOfferNotificationTemplate.html",
    placeholder
  );
  await sendEmail(to, subject, html);
};

const sendMembershipPurchaseNotification = async (to, membershipData) => {
  const subject = "Congratulations on Your Membership Card Purchase!";
  const supportEmail = config.email.support_email;
  const placeholders = { ...membershipData, supportEmail };
  const html = loadHtmlTemplate(
    "membershipPurchaseNotificationTemplate.html",
    placeholders
  );
  await sendEmail(to, subject, html);
};

const sendOfferRedeemPartnerNotification = async (to, offerData) => {
  const subject =
    "Congratulations! Your Offer Has Been Redeemed on DiscountCard 🎉";
  const placeholders = offerData;
  const html = loadHtmlTemplate(
    "offerRedeemptionNotificationTemplate.html",
    placeholders
  );
  await sendEmail(to, subject, html);
};

const sendOfferRedeemCustomerNotification = async (to, offerData) => {
  const subject =
    "Congratulations! You've Redeemed an Exclusive Offer with DiscountCard 🎉";
  const placeholders = offerData;
  const html = loadHtmlTemplate(
    "offerRedeemptionCustomerNotificationTemplate.html",
    placeholders
  );
  await sendEmail(to, subject, html);
};

const sendPartnerPaymentNotification = async (to, paymentDetails) => {
  const subject = " Payment Confirmation for Offer Activation";
  const placeholders = paymentDetails;
  const html = loadHtmlTemplate(
    "partnerPaymentNotificationTemplate.html",
    placeholders
  );
  await sendEmail(to, subject, html);
};

const sendOfferNotification = async (to, offerData) => {
  const subject = "Notification Regarding Your Offer on DiscountCard";
  const supportEmail = config.email.support_email;
  const OfferNotification =
    offerData.promotionStatus === "active"
      ? "Congratulations! Your offer has been approved and is now live on our platform. Users can start redeeming it immediately."
      : "We regret to inform you that your offer submission has been rejected. Please review the feedback provided and make necessary adjustments before resubmitting.";
  const placeholders = { OfferNotification, supportEmail };
  const html = loadHtmlTemplate("offerNotificationTemplate.html", placeholders);
  await sendEmail(to, subject, html);
};

const sendCompleteProfileNotification = async (to) => {
  const subject = "Complete Your Purchase on DiscountCard Today";
  const supportEmail = config.email.support_email;
  const placeholders = { supportEmail };
  const html = loadHtmlTemplate(
    "completeProfileNotificationTemplate.html",
    placeholders
  );
  await sendEmail(to, subject, html);
};

const sendContactUsEmail = async (user, messageDetails) => {
  const { subject, details } = messageDetails;
  const { email, firstName, lastName } = user;

  const supportEmail = config.email.support_email;
  const placeholders = {
    subject,
    email,
    username: firstName + lastName,
    message: details,
  };
  const html = loadHtmlTemplate("notificationTemplate.html", placeholders);
  await sendEmail(supportEmail, subject, html, email);
};

const sendInvoiceEmail = async (to, messageDetails) => {
  const { invoiceID, amount, fullName, invoiceLink } = messageDetails;
  const subject = "Invoice for Custom Services from DiscountCard";

  const supportEmail = config.email.support_email;
  const placeholders = {
    invoiceID,
    amount,
    date: moment().format("MMMM D, YYYY"),
    partnerName: fullName,
    supportEmail,
    invoiceLink,
  };
  const html = loadHtmlTemplate("invoiceTemplate.html", placeholders);
  await sendEmail(to, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailOnCreateUser,
  sendSignupInvitationEmail,
  sendChatLinkEmail,
  sendNewsLetterSubscribedEmail,
  sendNewsLetterSendEmailToAllSubscriptions,
  sendVerificationOtpEmail,
  sendOfferCreationEmail,
  sendMembershipPurchaseNotification,
  sendOfferRedeemCustomerNotification,
  sendOfferRedeemPartnerNotification,
  sendPartnerPaymentNotification,
  sendOfferNotification,
  sendCompleteProfileNotification,
  sendContactUsEmail,
  sendInvoiceEmail,
};
