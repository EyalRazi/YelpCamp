const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Database Connected!");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      author: "63d544cf0075392bce0a8099", // Your User ID (Mongo)
      city: `${cities[random1000].city}`,
      state: `${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dxwu6tzx6/image/upload/v1674909607/YelpCamp/rfsyy1hnjabsali04gyo.jpg",
          filename: "YelpCamp/rfsyy1hnjabsali04gyo",
        },

        {
          url: "https://res.cloudinary.com/dxwu6tzx6/image/upload/v1674908961/YelpCamp/xkmq2ihgn6t1gcv8xbwv.jpg",
          filename: "YelpCamp/xkmq2ihgn6t1gcv8xbwv",
        },
      ],
      description:
        "Borrow a tent, grab your friends, and take a trip to one of these hot camping destinations.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
  console.log("Seeded!");
});
