const Listing=require("../Models/listing");
const {listingSchema}=require("../schema.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

//MVC implementation making them as a module

module.exports.renderNewForm=(req, res) => {
    
    res.render("listings/new.ejs");
}


module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({path:"reviews", populate:{
        path:"author",
      }})
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    console.log(listing);
    console.log("Listing owner id:", listing.owner?._id);
    res.render("listings/show.ejs", { listing });
  }

  module.exports.createListing=async (req, res, next) => {

    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
        .send();
        

    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url,"..",filename);

      // validate input
      const { error } = listingSchema.validate(req.body);
      if (error) {
        throw new ExpressError(400, error.details.map(el => el.message).join(","));
      }
  
      // create new listing
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;   // current logged in user ko owner banao
      newListing.image={url,filename};
      newListing.geometry=response.body.features[0].geometry;
     let savedListing= await newListing.save();
     console.log(savedListing);
  
      req.flash("success", "New listing Created");
      res.redirect(`/listings/${newListing._id}`); // redirect to show page instead of index
    }

  module.exports.rendereditForm=async (req, res) => {
  let { id } = req.params;
   const listing = await Listing.findById(id)
  if(!listing){
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listing");

  }
  let originalImageUrl=listing.image.url;
  originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing ,originalImageUrl});
}

module.exports.updateListing=async (req, res) => {
let { id } = req.params;
let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file !=="undefined"){
  let url=req.file.path;
    let filename=req.file.filename;
    //console.log(url,"..",filename);

    listing.image={url,filename};

    await listing.save();
  }
    req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","Listing Deleted!");
  res.redirect("/listings");
}