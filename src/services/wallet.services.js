const httpStatus = require("http-status");
const { Wallet } = require("../models");
const ApiError = require("../utils/ApiError");

const createOrUpdateWallet = async (userId, updateData) => {
  const wallet = await Wallet.findOneAndUpdate({ userId }, updateData, {
    new: true,
    upsert: true,
    useFindAndModify: false,
  });
  if (!wallet) {
    throw new Error("something went wrong");
  }
  return wallet;
};
const getCustomerAccountId = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }
  return wallet;
};
const getTransactions = async (filters, options) => {
  const transactions = await Wallet.paginate(filters, options);
  return transactions;
};

const createPayout = async (userId, amount) => {
  const wallet = await getCustomerAccountId(userId);
  const balance = wallet.balance;
  if (wallet.balance < 20) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient Balance!");
  }
  wallet.balance = 0;
  await wallet.save();
  return { wallet, balance };
};
module.exports = {
  createOrUpdateWallet,
  getCustomerAccountId,
  createPayout,
};
