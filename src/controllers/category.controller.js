const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { CategoryService } = require("../services");
const { searchQueryConverter } = require("../utils/searchQueryConverter");
const { addTranslatedLocale } = require("../utils/addTranslatedLocale");

const createCategory = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const isCategory = await CategoryService.isCategoryExist(req.body.title);
  const translatedBody = await addTranslatedLocale(req.body, ["title"]);
  const category = await CategoryService.createCategory(translatedBody);
  res.send(category);
});

const updateCategory = catchAsync(async (req, res) => {
  req.body.targetLang = req.targetLang;
  const category = await CategoryService.updateCategory(
    req.params.categoryId,
    req.body
  );
  res.send(category);
});

const getCategories = catchAsync(async (req, res) => {
  const sortedDocs = [];
  const othersDocs = [];
  let filter = pick(req.query, [
    "all",
    "isActive",
    "role",
    "isApproved",
    "search",
  ]);
  if (filter.all) {
    const categories = await CategoryService.getRawCategories();
    return res.send(categories);
  }
  if (filter.search) {
    let searchQuery = searchQueryConverter(filter.search);
    filter = {
      ...filter,
      ...searchQuery,
    };
    delete filter["search"];
  }
  filter.isDeleted = false;
  let options = pick(req.query, ["sortBy", "limit", "page"]);
  const categoryToEnd = "Others";

  let result = await CategoryService.getCategories(filter, options);
  result.results.forEach((doc) => {
    if (doc.title === categoryToEnd) {
      sortedDocs.push(doc);
    } else {
      othersDocs.push(doc);
    }
  });
  result.results = othersDocs.concat(sortedDocs);

  res.send(result);
});

const getCategory = catchAsync(async (req, res) => {
  const category = await CategoryService.getCategoryById(req.params.categoryId);
  res.send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await CategoryService.deleteCategory(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCategory,
  updateCategory,
  getCategories,
  getCategory,
  deleteCategory,
};
