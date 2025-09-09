
const Joi=require("joi");
const review = require("./Models/review");

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        price:Joi.number().required(),
        country:Joi.string().required(),
        image: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().optional()
})
,
        category:Joi.string(),


    }).required(),

});


module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.string().required().min(1).max(100),
        comment:Joi.string().required(),

    })
})