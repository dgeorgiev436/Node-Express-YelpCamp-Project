const Campground = require("../models/campground");
// CLOUDINARY
const {cloudinary} = require("../cloudinary")
// MAPBOX
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async(req,res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", {campgrounds})
}

module.exports.renderNewForm = (req,res) => {
	res.render("campgrounds/new");
}

module.exports.renderEditForm = async(req,res) => {
	const campground = await Campground.findById(req.params.id);
	if(!campground){
		req.flash("error", "Can't find that campground!")
		return res.redirect("/campgrounds")
	}
	res.render("campgrounds/edit", {campground});
}

module.exports.createCampground = async(req,res, next) => {
		const geoData = await geocoder.forwardGeocode({
			query: req.body.campground.location,
			limit: 1
		}).send()
		const campground = await Campground.create(req.body.campground);
		campground.geometry = geoData.body.features[0].geometry;
		campground.images = req.files.map(f => ({url:f.path, filename: f.filename}))
		campground.author = req.user._id
		await campground.save();
		req.flash("success", "You have succesfully created a new campground");
		res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req,res, next) => {
	const {id} = req.params;
// 	HERE WE FIND THE CAMPGROND, WE POPULATE THE REVIEWS, WE POPULATE THE AUTHOR OF EACH REVIEW AND THEN WE POPULATE THE AUTHOR OF THE CAMPGROUND
	const campground = await Campground.findById(id).populate({
		path: "reviews",
		populate: {
			path: "author"
		}
	}).populate("author");
	if(!campground){
		req.flash("error", "Can't find that campground!")
		return res.redirect("/campgrounds")
	}
	res.render("campgrounds/show", {campground})
}

module.exports.updateCampground = async(req,res) => {
	const {id} = req.params;
	console.log(req.body);
	const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
	const imgs = req.files.map(f => ({url:f.path, filename: f.filename}));
	campground.images.push(...imgs);
	if(req.body.deleteImages){
	// 	LOOP THROUGH ALL IMAGES AND DELETE FROM CLOUDINARY
		for(let filename of req.body.deleteImages){
			await cloudinary.uploader.destroy(filename)
		}
	// 	PULL FOR IMAGES WHERE FILENAME IS IN THE REQ.BODY.DELETEIMAGES
		await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
	}
	await campground.save();
	req.flash("success", "You have succesfully updated the campground")
	res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req,res) => {
	const {id} = req.params;
	const campground = await Campground.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted campground")
	res.redirect("/campgrounds");
}