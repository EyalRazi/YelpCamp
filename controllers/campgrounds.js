const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  return res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  return res.render("campgrounds/new");
};

let foundCampgrounds = [];
let state = "";
let maxPrice;

module.exports.renderSearch = (req, res) => {
  return res.render("campgrounds/search", {
    foundCampgrounds,
    state,
    maxPrice,
  });
};

module.exports.searchCampgroundPost = async (req, res, next) => {
  state = req.body.state;
  maxPrice = req.body.maxPrice;
  console.log(req.body);
  foundCampgrounds = await Campground.find({
    state: `${state}`,
    price: { $lte: maxPrice },
  });
  if (foundCampgrounds.length > 0) {
    return res.render("campgrounds/search", {
      foundCampgrounds,
      state,
      maxPrice,
    });
  } else {
    req.flash(
      "error",
      `No campgrounds found in ${state} for less than ${maxPrice} dollar(s).`
    );
    return res.redirect("/campgrounds/search");
  }
};

module.exports.createCampground = async (req, res, next) => {
  const location = `${req.body.campground.city} ${req.body.campground.state}`;
  const geoData = await geocoder
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send();

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully Made A New Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(campground);

  if (!campground) {
    req.flash("error", "Campground Not Found");
    return res.redirect("/campgrounds");
  } else {
    return res.render("campgrounds/show", { campground });
  }
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Campground Not Found");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;

  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));

  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(campground);
  }
  req.flash("success", "Successfully Updated Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted Campground");

  return res.redirect("/campgrounds");
};
