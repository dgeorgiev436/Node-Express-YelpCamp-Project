const mongoose = require("mongoose");
const cities = require("./cities")
const {places, descriptors} = require("./seedHelpers")
const Campground = require("../models/campground")

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

// CHECK IF DATABASE CONNECTS
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
	console.log("Database connected");
});

const sample = (arr) => {
	return arr[Math.floor(Math.random() * arr.length)]
}
const seedDB = async() => {
	await Campground.deleteMany({});
		for(let i = 0; i < 150; i++){
			const randomCity = Math.floor(Math.random() * 50);
			const randomPrice = Math.floor(Math.random() * 20) + 10;
			const camp = await new Campground({
				author: "60d9e87db0207209605f47ec",
				location: `${cities[randomCity].city}, ${cities[randomCity].state}`,
				geometry: {
					 type: "Point",
					 coordinates: [
						cities[randomCity].longitude,
						cities[randomCity].latitude
					 ]
				},
				 images: [
    				{
					  url: 'https://res.cloudinary.com/dwv677e7x/image/upload/v1625176320/YelpCamp/xdotypjgjg9dkzjokbn8.jpg',
					  filename: 'YelpCamp/xdotypjgjg9dkzjokbn8'
    				},
    				{
					  url: 'https://res.cloudinary.com/dwv677e7x/image/upload/v1625176320/YelpCamp/geekckdjhidr8vmc1rsu.jpg',
					  filename: 'YelpCamp/geekckdjhidr8vmc1rsu'
					}
  				],
				title: `${sample(descriptors)} ${sample(places)}`,
				description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of  (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, , comes from a line in section 1.10.32.",
				price: randomPrice
			})
			await camp.save();
	}
}

seedDB().then(() => {
	mongoose.connection.close();
})
