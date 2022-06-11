const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review")

// https://res.cloudinary.com/dwv677e7x/image/upload/w_300/YelpCamp/xdotypjgjg9dkzjokbn8.jpg 

const imageSchema = new Schema(
		{
			url: String,
			filename: String
		}
)
// ADDING VIRTUAL METHOD TO IMAGESCHEMA, REPLACE REPLACES FIRST MATCH IN A STRING
imageSchema.virtual("thumbnail").get(function(){
	return this.url.replace("/upload", "/upload/w_200")
})

// ALLOW VIRTUALS with toJSON
const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
	title: {
		type: String,
	},
	images: [imageSchema],
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point',
			required: true
		},
		coordinates: {
			type: [Number],
			required: true
		}
	},
	price: {
		type: Number
	},
	description: {
		type: String
	},
	location: {
		type: String
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: "Review"
		}
	]
},opts)

// VIRTUAL
CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
	return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong> <p>${this.description.substring(0,50)}...</p>`
})

// MONGOOSE MIDDLEWARE TRIGGERED AFTER findByIdAndDelete. It deletes all reviews from the deleted campground
CampgroundSchema.post("findOneAndDelete", async function(campground) {
	if(campground.reviews.length){
		const res = await Review.deleteMany({_id: {$in: campground.reviews}});
		console.log(res);
	}
})

module.exports = mongoose.model("Campground", CampgroundSchema);