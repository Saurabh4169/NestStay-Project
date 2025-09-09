const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer =require('multer')
const {storage}=require("../cloudConfig.js");
const upload =multer({storage});

// Index (GET) and Create (POST)
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
   // validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );
  

// New listing form route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show / Update / Delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)   // ✅ fixed here
  );

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  
  wrapAsync(listingController.rendereditForm)
);

module.exports = router;
