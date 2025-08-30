const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { CategoryValidation } = require("../validations");
const { CategoryController } = require("../controllers");

const router = express.Router();
router
  .route("/")
  .post(
    auth("customer", "admin"),
    validate(CategoryValidation.addCategory),
    CategoryController.createCategory
  )
  .get(CategoryController.getCategories);
router
  .route("/:categoryId")
  .get(validate(CategoryValidation.getCategory), CategoryController.getCategory)
  .put(
    validate(CategoryValidation.getCategory),
    CategoryController.updateCategory
  )
  .delete(
    validate(CategoryValidation.getCategory),
    CategoryController.deleteCategory
  );

module.exports = router;
