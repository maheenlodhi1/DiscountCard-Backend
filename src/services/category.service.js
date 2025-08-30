const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Category, Promotion } = require("../models");
const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  if (!category) {
    throw new ApiError(500, "Something went wrong");
  }
  return category;
};
const getCategories = async (filters, options) => {
  const category = await Category.paginate(filters, options);
  return category;
};

const getRawCategories = async () => {
  const sortedDocs = [];
  const othersDocs = [];
  let categories = await Category.find({ isDeleted: false });
  categories.forEach((doc) => {
    if (doc.title === "Others") {
      sortedDocs.push(doc);
    } else {
      othersDocs.push(doc);
    }
  });
  categories = othersDocs.concat(sortedDocs);
  return categories;
};

const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found!");
  }
  return category;
};
const updateCategory = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  Object.assign(category, updateBody);
  await category.save();
};

const deleteCategory = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  category.isDeleted = true;
  return category.save();
};

const isCategoryExist = async (name) => {
  const category = await Category.findOne({ title: name, isDeleted: false });
  if (category) {
    throw new ApiError(
      httpStatus.ALREADY_REPORTED,
      "Category With same name already found!"
    );
  }
  return false;
};
const getRawCategoriesWithOfferCount = async () => {
  let categories = await Category.find({ isDeleted: false });
  const offerCounts = await Promotion.aggregate([
    { $match: { isDeleted: false, isActive: true } },
    { $group: { _id: "$categoryName", count: { $sum: 1 } } },
  ]);

  const offerCountMap = {};
  offerCounts.forEach((item) => {
    offerCountMap[item._id] = item.count;
  });

  categories = categories.map((category) => {
    return {
      ...category.toObject(),
      offerCount: offerCountMap[category.title] || 0,
    };
  });
  const sortedDocs = [];
  const othersDocs = [];
  categories.forEach((doc) => {
    if (doc.title === "Others") {
      othersDocs.push(doc);
    } else {
      sortedDocs.push(doc);
    }
  });
  categories = sortedDocs.concat(othersDocs);
  return categories;
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getRawCategories,
  isCategoryExist,
  getRawCategoriesWithOfferCount,
};
