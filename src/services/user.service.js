const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const { User, contactUS, Review, Partner, Customer } = require("../models");
const ApiError = require("../utils/ApiError");
const adminSettingsServices = require("./adminSettings.service");
const WalletServices = require("./wallet.services");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken!");
  }
  const user = await User.create(userBody);
  return user;
};

const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email, isDeleted: false });
};

const getUserByPhoneNumber = async (phoneNo) => {
  return User.findOne({ phoneNo });
};

const checkEmail = async (email) => {
  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return true;
};

const checkPhoneNumber = async (phone) => {
  if (await User.isPhoneNoTaken(phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone Number already taken");
  }
  return true;
};
/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const getUserByEmailOrNumber = async (emailOrNumber, updateBody) => {
  const filter = {
    $or: [{ email: emailOrNumber }, { phoneNo: emailOrNumber }],
  };

  const updatedUser = await User.findOne(filter);
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  return updatedUser;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  user.isDeleted = true;
  await user.save();
  return user;
};

const googleLogin = async (userData) => {
  const user = await getUserByEmail(userData.email);
  if (user) {
    return user;
  }
  const newUser = await createUser(userData);
  return newUser;
};
const changePassword = async (userId, data) => {
  const user = await User.findById(userId);
  try {
    const res = await bcrypt.compare(data.oldPassword, user.password);
    if (res) {
      Object.assign(user, { password: data.newPassword });
      await user.save();
    } else throw new ApiError(httpStatus[422], "Old password didn't match");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
const updateUserByEmailOrNumber = async (emailOrNumber, updateBody) => {
  const filter = {
    $or: [{ email: emailOrNumber }, { phoneNo: emailOrNumber }],
    isDeleted: false,
  };

  const updatedUser = await User.findOneAndUpdate(filter, updateBody);
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }
  return updatedUser;
};

const applyReferralBonus = async (user, fee) => {
  const {
    data: { referralCommission },
  } = await adminSettingsServices.getDataByType("referralCommission");

  const discount = (fee * referralCommission) / 100;

  // Update referrer's wallet balance
  const wallet = await WalletServices.createOrUpdateWallet(user.referBy, {
    balance: Math.max(parseInt(discount), 0),
  });

  await updateUserById(user.referBy, { wallet: wallet.id });
};
const getUserStats = async (type) => {
  const UserObject = type == "partner" ? Partner : Customer;
  const currentYear = new Date().getFullYear();

  const result = await UserObject.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(currentYear, 0, 1) },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dateArray = Array.from({ length: 12 }, (_, index) => {
    const match = result.find((item) => item._id.month === index + 1);
    return {
      _id: { month: index + 1, year: currentYear },
      count: match ? match.count : 0,
    };
  });
  const count = await UserObject.count({ isDeleted: false });
  const chartData = {
    count,
    series: [
      {
        name: type == "partner" ? "Partners Registered" : "Customer Registered",
        data: dateArray.map((item) => item.count),
      },
    ],
    xaxis: {
      categories: dateArray.map((item) => `${monthNames[item._id.month - 1]}`),
    },
  };

  return chartData;
};

module.exports = {
  checkPhoneNumber,
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  checkEmail,
  googleLogin,
  changePassword,
  getUserByPhoneNumber,
  getUserByEmailOrNumber,
  updateUserByEmailOrNumber,
  getUserStats,
  applyReferralBonus,
};
