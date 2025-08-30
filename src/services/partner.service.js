const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const { Partner, User } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody, requester) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken!");
  }
  if (await User.isPhoneNoTaken(userBody.phoneNo)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Phone number already taken!");
  }
  if (requester === "admin") {
    userBody.isEmailVerified = true;
  }
  const user = await Partner.create(userBody);
  return user;
};

const queryUsers = async (filter, options) => {
  const users = await Partner.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return await Partner.findOne({ _id: id, isDeleted: false }).populate({
    path: "offers",
    match: { isDeleted: { $ne: true } },
  });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return Partner.findOne({ email, isDeleted: false });
};

const getUserByPhoneNumber = async (phoneNo) => {
  return Partner.findOne({ phoneNo });
};

const checkEmail = async (email) => {
  if (await Partner.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return true;
};

const checkPhoneNumber = async (phone) => {
  if (await Partner.isPhoneNoTaken(phone)) {
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
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }
  if (user.offers.length > 1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Partner could list only one offer!"
    );
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const getUserByEmailOrNumber = async (emailOrNumber, updateBody) => {
  const filter = {
    $or: [{ email: emailOrNumber }, { phoneNo: emailOrNumber }],
  };

  const updatedUser = await Partner.findOne(filter);
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found!");
  }
  return updatedUser;
};

const updateUserByEmailOrNumber = async (emailOrNumber, updateBody) => {
  const filter = {
    $or: [{ email: emailOrNumber }, { phoneNo: emailOrNumber }],
    isDeleted: false,
  };

  const updatedUser = await Partner.findOneAndUpdate(filter, updateBody);
  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found!");
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
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }
  user.isDeleted = true;
  await user.save();
  return user;
};

const removeOffer = async (offerId, userId) => {
  const user = await Partner.findByIdAndUpdate(userId, {
    $pull: { offers: offerId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }
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
  const user = await Partner.findById(userId);
  try {
    const res = await bcrypt.compare(data.oldPassword, Partner.password);
    if (res) {
      Object.assign(user, { password: data.newPassword });
      await Partner.save();
    } else throw new ApiError(httpStatus[422], "Old password didn't match");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const getRawPartners = async () => {
  const partners = await Partner.find({ isDeleted: false });
  if (!partners) throw new ApiError(httpStatus.NOT_FOUND, "No partners data!");
  return partners;
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
  removeOffer,
  getRawPartners,
};
