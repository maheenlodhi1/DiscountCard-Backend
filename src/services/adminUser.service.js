const httpStatus = require("http-status");
const { AdminUser } = require("../models");
const ApiError = require("../utils/ApiError");
const tokenServices = require("./token.service");

/**
 * Create a AdminUser
 * @param {Object} adminUserBody
 * @returns {Promise<AdminUser>}
 */
const createAdminUser = async (adminUserBody) => {
  if (await AdminUser.isEmailTaken(adminUserBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  const adminUser = await AdminUser.create(adminUserBody);
  return adminUser;
};

const queryAdminUsers = async (filter, options) => {
  const AdminUsers = await AdminUser.paginate(filter, options);
  return AdminUsers;
};

/**
 * Get AdminUser by id
 * @param {ObjectId} id
 * @returns {Promise<AdminUser>}
 */
const getUserById = async (id) => {
  return AdminUser.findById(id);
};

/**
 * Get AdminUser by email
 * @param {string} email
 * @returns {Promise<AdminUser>}
 */
const getAdminUserByEmail = async (email) => {
  return AdminUser.findOne({ email });
};

const checkEmail = async (email) => {
  if (await AdminUser.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  return true;
};

/**
 * Update AdminUser by id
 * @param {ObjectId} AdminUserId
 * @param {Object} updateBody
 * @returns {Promise<AdminUser>}
 */
const updateAdminUserById = async (AdminUserId, updateBody) => {
  const AdminUser = await getUserById(AdminUserId);
  if (!AdminUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "AdminUser not found");
  }
  Object.assign(AdminUser, updateBody);
  await AdminUser.save();
  return AdminUser;
};

/**
 * Delete AdminUser by id
 * @param {ObjectId} AdminUserId
 * @returns {Promise<AdminUser>}
 */

const deleteAdminUserById = async (AdminUserId) => {
  const AdminUser = await getUserById(AdminUserId);
  if (!AdminUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "AdminUser not found");
  }
  await AdminUser.remove();
  return AdminUser;
};

module.exports = {
  createAdminUser,
  queryAdminUsers,
  getUserById,
  getAdminUserByEmail,
  updateAdminUserById,
  deleteAdminUserById,
  checkEmail,
};
