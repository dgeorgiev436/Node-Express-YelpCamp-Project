const User = require("../models/user")

module.exports.renderRegisterForm = (req,res) => {
	res.render("auth/register")
}

module.exports.createRegistration = async(req,res, next) => {
	try{
	const {email, username, password} = req.body;
	const user = new User({email, username: username});
	const registeredUser = await User.register(user, password);
// 	Log the user in after registration
	req.login(registeredUser, err => {
		if(err) return next(err);
// 		ELSE
		req.flash("success", "Welcome to YelpCamp");
		res.redirect("/campgrounds");
	});
	}catch(e){
		req.flash("error",e.message);
		res.redirect("/register");
	}
}

module.exports.renderLoginForm =  (req,res) => {
	res.render("auth/login");
}

module.exports.loginUser = (req,res) => {
	req.flash("success", "Welcome back!");
// 	store last url from the session
	const redirectUrl = req.session.returnTo || "/campgrounds"
// 	delete last url from the session
	delete req.session.returnTo;
	res.redirect(redirectUrl)
}

module.exports.logoutUser = (req,res) => {
// 	PASSPORT METHOD FOR LOGOUT
	req.logout();
	req.flash("success", "You have been signed out");
	res.redirect("/campgrounds")
}