const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().required(),
  types: Joi.array().unique().items(Joi.string()).optional(),
});

const categoryTypeSchema = Joi.object({
  type: Joi.string().required(),
});

const validateCategory = (data) => {
  return categorySchema.validate(data, { abortEarly: false });
};

const validateCategoryType = (data) => {
  return categoryTypeSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCategory,
  validateCategoryType,
};
