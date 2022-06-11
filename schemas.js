const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html")

// DEFINING EXTENSION ON JOI.STRING CALLED escapeHTML USIGN THE SANITIZE-HTML NPM PACKAGE
const extension = (joi) => ({
	type: "string",
	base: joi.string(),
	messages: {
		"string.escapeHTML": "{{#label}} must not include HTML!"
	},
	rules: {
		escapeHTML: {
			validate(value, helpers){
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if(clean !== value) return helpers.error("string.escapeHTML", { value })
				return clean;
			}
		}
	}
})

const Joi = BaseJoi.extend(extension)





// JOI SERVER SIDE VALIDATION SCHEMA
module.exports.campgroundSchema = Joi.object({
			campground: Joi.object({
				title: Joi.string().required().escapeHTML(),
				price: Joi.number().required().min(0),
				// image: Joi.string().required(),
				location: Joi.string().required().escapeHTML(),
				description: Joi.string().required().min(15).max(1000).escapeHTML()
			}).required(),
			deleteImages: Joi.array()
		})

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		body: Joi.string().required().escapeHTML(),
		rating: Joi.number().required().min(1).max(5)
	}).required()
})