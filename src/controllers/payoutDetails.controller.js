const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { PayoutDetailsService, WalletServices } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");
const {
  encryptObject,
  decryptObject,
  decrypt,
} = require("../utils/encryption");

const managePayoutDetails = catchAsync(async (req, res) => {
  let decryptedBody;
  if (typeof req.body !== "object") {
    const encryptedBody = req.body.toString();
    const decryptedText = decrypt(encryptedBody);
    decryptedBody = JSON.parse(decryptedText);
  } else {
    decryptedBody = req.body;
  }
  const payload = encryptObject(decryptedBody);
  const wallet = await WalletServices.getCustomerAccountId(req.user.id);
  let payoutDetails;
  if (!wallet.accountId) {
    payoutDetails = await PayoutDetailsService.addPayoutDetails(
      decryptedBody.type,
      payload
    );
  } else {
    payoutDetails = await PayoutDetailsService.updatePayoutDetails(
      wallet.accountId,
      decryptedBody
    );
  }
  if (payoutDetails) {
    wallet.accountId = payoutDetails.id;
    wallet.hasPayoutMethod = true;
    await wallet.save();
  }
  if (!req.user.wallet) {
    req.user.wallet = wallet.id;
    await req.user.save();
  }
  res.status(httpStatus.NO_CONTENT).send();
});

const updatePayoutDetails = catchAsync(async (req, res) => {
  const payoutDetails = await PayoutDetailsService.updatePayoutDetails(
    req.params.payoutDetailsId,
    req.body
  );
  res.send(payoutDetails);
});

const getPayoutDetails = catchAsync(async (req, res) => {
  const payoutDetails = await PayoutDetailsService.getPayoutDetailsById(
    req.params.payoutDetailsId,
    true
  );
  res.send(payoutDetails);
});

const deletePayoutDetails = catchAsync(async (req, res) => {
  await PayoutDetailsService.deletePayoutDetails(req.params.payoutDetailsId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getPayoutMethod = catchAsync(async (req, res) => {
  const wallet = await WalletServices.getCustomerAccountId(req.user.id);
  const payoutDetail = await PayoutDetailsService.getPayoutDetailsById(
    wallet.accountId,
    true
  );
  const { type, accountNumber, beneficiaryName, phoneNo, name, bankName } =
    payoutDetail;

  let response = {};
  if (type === "bank") {
    response = {
      company: bankName.toUpperCase(),
      name: beneficiaryName,
      accountNumber: obfuscateValue(accountNumber),
    };
  } else if (type === "alansari") {
    response = {
      company: "ALANSARI",
      name: name,
      accountNumber: obfuscateValue(phoneNo),
    };
  }
  res.status(httpStatus.OK).send(response);
});

const obfuscateValue = (value) => {
  return "*".repeat(value.length - 4) + value.slice(-4);
};

module.exports = {
  managePayoutDetails,
  updatePayoutDetails,
  getPayoutDetails,
  deletePayoutDetails,
  getPayoutMethod,
};
