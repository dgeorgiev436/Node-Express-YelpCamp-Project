// CHECK IF IN PRODUCTION, IF NOT REQUIRE AND CONFIGURE DOTENV
if(process.env.NODE_ENV !== "production"){
	require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session")
const flash = require("connect-flash")
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const MongoDBStore = require('connect-mongo');

const campgroundRoutes = require("./Routes/campgrounds");
const reviewRoutes = require("./Routes/reviews");
const authRoutes = require("./Routes/auth");

// MONGO ATLAS URL + PASSWORD
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"

// LOCAL HOST DB
// mongodb://localhost:27017/yelp-camp


mongoose.connect(dbUrl, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

// CHECK IF DATABASE CONNECTS
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database connected");
})

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// PARSING A BODY FROM A FORM
app.use(express.urlencoded({ extended: true }))
// METHOD OVERRIDE
app.use(methodOverride("_method"))
// SERVING THE PUBLIC DIRECTORY
app.use(express.static(path.join(__dirname, "public")))
// MONGO SANITIZE PACKAGE PREVENTING POTENTIAL MONGO INJECTIONS
app.use(mongoSanitize());

// HELMET NPM PACKAGE
// {contentSecurityPolicy: false}
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
	"https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwv677e7x/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || "thisisthesecret"
// USING CONNECT-MONGO TO CONNECT SESSION TO THE DB INSTEAD SAVING ON THE MEMORY
const store = MongoDBStore.create({
	mongoUrl: dbUrl,
	secret,
// 	Save data every 1 day
	touchAfter: 24 * 60 * 60  
})

store.on("error", function(e){
	console.log("SESSION STORE ERROR" + e)
})
// CONFIGURING SESSION
app.use(session({
	store,
	name: "session",
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true, 
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}))
app.use(flash());


// CONFIGURATE PASSPORT 
app.use(passport.initialize());
app.use(passport.session());
// USING LOCAL STRATEGY USERNAME/PASSWORD
passport.use(new LocalStrategy(User.authenticate()))

// CONFIGURATE PASSPORT SERIALIZE AND DESERIALIZE USER LOGIN/LOGOUT USER
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// JOI SERVER SIDE VALIDATION MIDDLEWARE
mongoose.set('useFindAndModify', false);

// PASS SUCCESS AND ERROR MESSAGES TO ALL ROUTES AND FILES
app.use((req,res,next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
// PASS THE CURRENT LOGGED IN USER DATA TO ALL ROUTES AND FILES
	res.locals.currentUser = req.user;
	next();
})



// ROUTE HANDLERS
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", authRoutes)
// HOME ROUTE


app.get("/", (req,res) => {
	res.render("home")
})


// ERROR HANDLER MIDDLEWARE
app.all("*", (req,res, next) => {
	next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
	const {statusCode = 500}  = err;
	if(!err.message) err.message = "OH NO, SOMETHING WENT WRONG BROTHER"
	res.status(statusCode).render("error", {err});
	// res.send("SOMETHIGN WENT WRONG BRO")
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`SERVER RUNNING ON PORT ${port}`)
})