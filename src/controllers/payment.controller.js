const httpStatus = require("http-status");
const {
  StripeServices,
  WalletServices,
  PayoutRequestsService,
} = require("../services");
const catchAsync = require("../utils/catchAsync");
const pick = require("../utils/pick");

const addPaymentDetails = catchAsync(async (req, res) => {
  const result = await StripeServices.createAccount(req.params.userId);
  res.status(httpStatus.OK).send({
    clientSecret: result.client_secret,
    message: "Payments Details added successfully!",
  });
});

const createPayout = catchAsync(async (req, res) => {
  const { wallet, balance } = await WalletServices.createPayout(req.user);
  const payoutRequest = await PayoutRequestsService.createPayoutRequest({
    userId: req.user.id,
    userEmail: req.user.email,
    amount: balance,
    accountId: wallet.accountId,
  });
  res.status(httpStatus.OK).send({
    message: "Payout succeeded",
  });
});

const getPaymentMethodDetails = catchAsync(async (req, res) => {
  const payment = await StripeServices.getPaymentMethodDetails(req.user);
  if (payment) res.status(httpStatus.OK).send(payment);
  else res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  addPaymentDetails,
  createPayout,
  getPaymentMethodDetails,
};
