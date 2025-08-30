const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const {
  SubscriptionsServices,
  userService,
  CouponServices,
  SubscriptionTypesServices,
  StripeServices,
} = require("../services");

const checkMembershipDetails = catchAsync(async (req, res) => {
  const membership = await SubscriptionsServices.checkMembership(req.params.id);
  await SubscriptionsServices.rotateMembership(membership.userId);
  res.send(membership);
});

const buySubscription = catchAsync(async (req, res) => {
  const { subscriptionType, code } = pick(req.query, [
    "subscriptionType",
    "code",
  ]);
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No user found!");
  }
  const isValid = await SubscriptionsServices.isValidSubscription(
    user.subscriptionId
  );
  if (isValid) {
    throw new ApiError("You have already valid subscription");
  }

  let selectedSubscriptionData =
    await SubscriptionTypesServices.getSubscriptionTypeById(subscriptionType);
  let fee = selectedSubscriptionData.amount;

  // Apply discount if a coupon code is provided
  if (code) {
    fee = await CouponServices.applyDiscount(selectedSubscriptionData, code);
  }

  selectedSubscriptionData.amount = fee;
  let response;
  if (selectedSubscriptionData.amount > 0) {
    response = await StripeServices.createBuySubscriptionSession(
      user,
      selectedSubscriptionData,
      req.targetLang
    );
    // user.subscriptionStatus = { status: "requested" };
    // await user.save();

    let subscription;
    if (user.userType === "customer") {
      subscription = await SubscriptionsServices.createMembershipCard(
        user,
        req.targetLang,
        selectedSubscriptionData
      );
    } else if (user.userType === "partner") {
      subscription = await SubscriptionsServices.createSubscription({
        userId: user.id,
        subscriptionType: selectedSubscriptionData.id,
        duration: selectedSubscriptionData.duration,
        cardName: selectedSubscriptionData.packageType || "Partner Plan",
        status: "active",
      });
    }
    user.subscription = subscription.id;
    user.subscriptionStatus = { status: "active" };
    await user.save();
  } else {
    const subscription = await SubscriptionsServices.createMembershipCard(
      user,
      req.targetLang,
      selectedSubscriptionData
    );
    user.subscription = subscription.id;
    await user.save();

    response = {
      status: "success",
      msg: "Congratulations. you are member now!",
    };
  }
  res.status(httpStatus.OK).send(response);
});

const rotateMembership = catchAsync(async (req, res) => {
  const customerId = req.user.id;
  const membership = await SubscriptionsServices.rotateMembership(customerId);
  res.status(httpStatus.OK).send(membership);
});

const createSubscriptionInvoice = catchAsync(async (req, res) => {
  const link = await StripeServices.createInvoiceLink(req.body);
  res.status(httpStatus.NO_CONTENT).send("Link created successfully!");
});

module.exports = {
  checkMembershipDetails,
  buySubscription,
  rotateMembership,
  createSubscriptionInvoice,
};
