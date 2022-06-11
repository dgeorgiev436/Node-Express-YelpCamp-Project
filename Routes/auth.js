const express = require("express");
const router = express.Router();
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const auths = require("../controllers/auth")

router.route("/register")
	.get(auths.renderRegisterForm)
	.post(catchAsync(auths.createRegistration));

router.route("/login")
	.get(auths.renderLoginForm)
	.post(passport.authenticate("local", {failureflash: true, failureRedirect: "/login"}), auths.loginUser)

router.get("/logout", auths.logoutUser)

module.exports = router;