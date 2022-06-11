const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const User = require("../models/user")
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware")
const campgrounds = require("../controllers/campgrounds");
const multer  = require('multer')
const storage = require("../cloudinary")
const upload = multer(storage)



// NEW ROUTE
router.get("/new", isLoggedIn,campgrounds.renderNewForm);


// INDEX AND CREATE ROUTES CHAINED TOGETHER VIA ROUTER.ROUTE
router.route("/")
	.get(catchAsync(campgrounds.index))
	.post(isLoggedIn, upload.array("image"),validateCampground,catchAsync(campgrounds.createCampground))

// SHOW, UPDATE AND DELETE ROUTES CHAINED TOGETHER VIA ROUTER.ROUTE
router.route("/:id")
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn,isAuthor,upload.array("image"),validateCampground,catchAsync(campgrounds.updateCampground))
	.delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))


// EDIT ROUTE
router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))

module.exports = router