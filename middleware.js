const Campground = require("./models/campground");
const Review = require("./models/review");
const {campgroundSchema, reviewSchema} = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");



// Middleware that checks if user is logged in
module.exports.isLoggedIn = (req,res,next) => {
	if(!req.isAuthenticated()){
// 		Store last url in the session
		req.session.returnTo = req.originalUrl;
		req.flash("error", "You must be signed in");
		return res.redirect("/login");
	}
	next();
}

// Validate campground
module.exports.validateCampground = (req,res,next) => {
		const {error} = campgroundSchema.validate(req.body);
		if(error){
			const msg = error.details.map(el => el.message).join(",")
			throw new ExpressError(msg, 400);
		}else{
			next();
		}
}

// CHECK AUTHORIZATION MIDDLEWARE
module.exports.isAuthor = async(req,res,next) => {
	const {id} = req.params;
	const campground = await Campground.findById(id);
	if(!campground.author.equals(req.user._id)){
		req.flash("error", "You do not have permission to do that");
		return res.redirect(`/campgrounds/${id}`)
	}
	next();
}

// VALIDATE REVIEW
module.exports.validateReview = (req,res,next) => {
	const {error} = reviewSchema.validate(req.body);
	if(error){
		const msg = error.details.map(el => el.message).join(",");
		throw new ExpressError(msg, 400);
	}else{
		next();
	}
}

// CHECK IF USER IS REVIEW AUTHOR
module.exports.isReviewAuthor = async(req,res,next) => {
	const {id,reviewId} = req.params;
	const review = await Review.findById(reviewId)
	if(!review.author._id.equals(req.user._id)){
		req.flash("error", "You do not have permission to do that");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
}