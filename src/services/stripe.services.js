const stripe = require("stripe");
const httpStatus = require("http-status");
const config = require("../config/config");
const loadStripe = stripe(config.stripe.stripeSecretKey);
const getLogger = require("../config/logger");
const WalletServices = require("./wallet.services");
const { getUserById } = require("./customer.service");
const ApiError = require("../utils/ApiError");
const SubscriptionsServices = require("./subscriptions.service");
const emailService = require("./email.service");
const moment = require("moment");
const userService = require("./user.service");
const logger = getLogger("StripeService");

const createAccount = async (userId) => {
  const user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "Customer not found!");
  if (user.wallet) {
    const wallet = await WalletServices.getCustomerAccountId(userId);
    const paymentMethods = await loadStripe.paymentMethods.list({
      customer: wallet.customerId,
      type: "card",
    });
    if (paymentMethods.data.length > 1) {
      const paymentMethod = await loadStripe.paymentMethods.detach(
        paymentMethods.data[0].id
      );
    }
    intent = await loadStripe.setupIntents.create({
      customer: wallet.customerId,
      automatic_payment_methods: { enabled: true },
    });
  } else {
    const customer = await loadStripe.customers.create({ email: user.email });
    intent = await loadStripe.setupIntents.create({
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });
    if (customer) {
      wallet = await WalletServices.createOrUpdateWallet(userId, {
        customerId: customer.id,
      });
      Object.assign(user, { wallet: wallet.id });
      await user.save();
    }
  }
  return intent;
};

const createCustomerPayment = async (userId, fee) => {
  const wallet = await WalletServices.getCustomerAccountId(userId);
  const paymentMethods = await loadStripe.paymentMethods.list({
    customer: wallet.customerId,
    type: "card",
  });
  if (paymentMethods.data.length < 1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Error while fetching the card details"
    );
  }
  try {
    const paymentIntent = await loadStripe.paymentIntents.create({
      amount: fee * 100,
      currency: "aed",
      automatic_payment_methods: { enabled: true },
      customer: wallet.customerId,
      payment_method: paymentMethods.data[0].id,
      off_session: true,
      confirm: true,
    });
    return paymentIntent;
  } catch (err) {
    console.log("Error code is: ", err.code);
    const paymentIntentRetrieved = await loadStripe.paymentIntents.retrieve(
      err.raw.payment_intent.id
    );
    console.log("PI retrieved: ", paymentIntentRetrieved.id);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Error while processing payment"
    );
  }
};

const createInvoiceLink = async (invoiceData) => {
  const user = await userService.getUserById(invoiceData.user);
  if (user.subscription) {
    throw new ApiError(
      httpStatus.ALREADY_REPORTED,
      "User has already subscription!"
    );
  }
  const metadata = {
    id: user.id,
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`,
  };
  let response;
  if (invoiceData.amount > 0) {
    response = await loadStripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aed",
            product_data: {
              name: "Custom Subscription",
            },
            unit_amount: invoiceData.amount * 100,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          userData: JSON.stringify(metadata),
        },
      },
      mode: "payment",
      success_url: `${config.clientUrl}payment/success`,
      cancel_url: `${config.clientUrl}payment/failure`,
    });
    await emailService.sendInvoiceEmail(user.email, {
      invoiceID: response.id,
      amount: invoiceData.amount,
      invoiceLink: response.url,
      ...metadata,
    });
  } else {
    const subscription = await SubscriptionsServices.createCustomSubscription({
      userId: user.id,
    });
    user.subscription = subscription.id;
    user.subscriptionStatus = {
      status: "active",
    };
    await user.save();
    response = true;
  }
  return response;
};

const createWithdrawSession = async (userId, amount) => {
  const wallet = await WalletServices.getCustomerAccountId(userId);
  if (wallet.balance < 20) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient Balance!");
  }
  let payout;
  try {
    payout = await loadStripe.transfers.create({
      amount: wallet.balance * 100,
      currency: "aed",
      destination: wallet.accountId,
    });
  } catch (error) {
    if (error.code == "balance_insufficient") {
      throw new ApiError(422, "Error while creating payout");
    }
    throw new ApiError(422, error);
  }
  return true;
};

const webhook = async (request, response) => {
  console.log("Calling Webhook", request?.body);

  const sig = request.headers["stripe-signature"];
  const payLoad = request.body;

  let event;
  try {
    event = await stripe.webhooks.constructEvent(
      payLoad,
      sig,
      config.stripe.stripeEndPointSecret
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err}`);
    logger.info("webhook failed");
    return;
  }
  // Handle the event
  switch (event.type) {
    case "payment_intent.canceled":
      logger.info("payment failed");
      try {
        // if (customerId && duration) {
        //   const customer = await customerServices.getUserById(customerId);
        //   customer.membershipStatus = { reason: "Payment Failed" };
        //   await customer.save();
        // }
      } catch (error) {
        logger.info(error);
      }
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case "payment_intent.succeeded":
      try {
        let { userData, subscriptionData } = event.data.object.metadata;
        let { amount, id } = event.data.object;
        if (userData) {
          userData = JSON.parse(userData);
          const { id, email } = userData;
          const subscription =
            await SubscriptionsServices.createCustomSubscription({
              userId: id,
            });
          const user = await userService.updateUserById(id, {
            subscription: subscription.id,
            subscriptionStatus: {
              status: "active",
            },
          });
          // const now = moment();
          // const purchaseDate = now.format("MMMM Do YYYY, h:mm:ss a");
          // const emailData = {
          //   offerName: offer.title,
          //   amountPaid: amount / 100,
          //   transactionId: id,
          //   purchaseDate,
          // };
          // await emailService.sendPartnerPaymentNotification(
          //   partnerEmail,
          //   emailData
          // );
        } else if (subscriptionData) {
          subscriptionData = JSON.parse(subscriptionData);
          const {
            customerId,
            membershipType,
            packageType,
            subscriptionTypeId,
            duration,
            targetLang,
          } = subscriptionData;

          const user = await userService.getUserById(customerId);
          let subscription = null;
          if (user.userType === "customer") {
            subscription = await SubscriptionsServices.createMembershipCard(
              user,
              targetLang,
              { duration, id: subscriptionTypeId }
            );
            // Handle referral bonus for customers only
            if (user.userType === "customer" && user.referBy) {
              await userService.applyReferralBonus(user, amount / 100);
            }
          } else if (user.userType === "partner") {
            subscription = await SubscriptionsServices.createSubscription({
              userId: user.id,
              subscriptionType: subscriptionTypeId,
              duration: duration,
              cardName: packageType,
            });
          }
          if (user) {
            user.subscription = subscription.id;
            await user.save();
          }
          const now = moment();
          const purchaseDate = now.format("MMMM Do YYYY, h:mm:ss a");
          const emailData = {
            membershipType: membershipType || packageType,
            amountPaid: amount / 100,
            transactionId: id,
            purchaseDate,
          };
          await emailService.sendMembershipPurchaseNotification(
            user.email,
            emailData
          );
        }
      } catch (error) {
        logger.info(error);
      }
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case "account.external_account.created":
      logger.info("account created successfully");
      break;
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }
  return response.status(200).send("success");
  // Return a 200 response to acknowledge receipt of the event
};

const createOrUpdateCustomerPayoutAccount = async (user) => {
  const wallet = await WalletServices.getCustomerAccountId(user.id);
  let account;
  // if (!wallet.accountId) {
  account = await loadStripe.accounts.create({
    type: "standard",
    country: "AE",
    email: user.email,
    business_type: "company",
    // capabilities: {
    //   //   card_payments: { requested: true },
    //   transfers: { requested: true },
    // },
  });
  // }
  const accountId = account?.id || wallet.accountId;
  const accountLink = await loadStripe.accountLinks.create({
    account: accountId,
    refresh_url: `${config.backendUrl}/api/v1/stripe/manage-payout`,
    return_url: `${config.clientUserUrl}`,
    type: "account_onboarding",
  });
  wallet.accountId = accountId;
  wallet.hasPayoutMethod = true;
  await wallet.save();
  return accountLink;
};

const getPaymentMethodDetails = async (userId) => {
  const wallet = await WalletServices.getCustomerAccountId(userId);
  if (wallet.customerId) {
    const paymentMethods = await loadStripe.paymentMethods.list({
      customer: wallet.customerId,
      type: "card",
    });
    if (paymentMethods) {
      const { brand, last4 } = paymentMethods.data[0].card;
      return { cardType: brand, cardNumber: last4 };
    }
  }
  return false;
};

const createBuySubscriptionSession = async (
  customer,
  subscriptionType,
  targetLang,
  currency = "GBP"
) => {
  const session = await loadStripe.checkout.sessions.create({
    customer_email: customer.email,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name:
              subscriptionType.memberShipType || subscriptionType.packageType,
          },
          unit_amount: subscriptionType.amount * 100,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        subscriptionData: JSON.stringify({
          customerId: customer.id,
          duration: subscriptionType.duration,
          membershipType: subscriptionType.memberShipType,
          packageType: subscriptionType.packageType,
          targetLang,
          subscriptionTypeId: subscriptionType.id,
        }),
      },
    },
    mode: "payment",
    success_url: `${config.clientUrl}payment/success`,
    cancel_url: `${config.clientUrl}payment/failure`,
  });
  if (!session) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "something went wrong"
    );
  }
  return session;
};

module.exports = {
  createCustomerPayment,
  createWithdrawSession,
  createAccount,
  createInvoiceLink,
  webhook,
  createOrUpdateCustomerPayoutAccount,
  getPaymentMethodDetails,
  createBuySubscriptionSession,
};
