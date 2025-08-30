const Joi = require("joi").extend(require("@joi/date"));
const { objectId } = require("./custom.validation");

const createData = {
  body: Joi.object({
    data: Joi.object().required(),
    type: Joi.string().required(),
  }),
};

module.exports = {
  createData,
};
