const Joi = require("joi")

const productValidationSchema = Joi.object({
    title: Joi.string().required().trim(),
    price: Joi.number().required().min(0),
    description: Joi.string().required().trim(),
    category: Joi.string().required().trim(),
    type: Joi.string().required().trim(),
    quantity: Joi.number().integer().min(1).default(1),
    userId: Joi.string().required(),
    media: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            type: Joi.string().required()
        })
    ),
    location: Joi.object({
        country: Joi.string().required().trim(),
        state: Joi.string().required().trim(),
        city: Joi.string().required().trim()
    }).required(),
    status: Joi.string()
})

const validateProduct = (data) => {
    return productValidationSchema.validate(data, { abortEarly: false })
}

module.exports = {
    validateProduct
}