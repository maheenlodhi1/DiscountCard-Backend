const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const addCategory = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    subTitle: Joi.string(),
    img: Joi.string().required(),
  }),
};

const updateCategory = {
  body: Joi.object().keys({
    title: Joi.string(),
    subTitle: Joi.string(),
    img: Joi.string(),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  addCategory,
  updateCategory,
  getCategory,
};
