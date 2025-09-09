const express=require("express");
const router=express.Router({mergeParams:true});

const wrapAsync = require("../utils/wrapAsync.js");   // ✅ correct
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema}=require("../schema.js")
const Review=require("../Models/review.js");
const Listing = require("../Models/listing.js");
const {validateReview, isLoggedIn, isReviewauthor} = require("../middleware.js");
const reviewController=require("../controllers/review.js");








// Reviews
// Post Route
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

// Delete of review from buttomn

router.delete("/:reviewId",isLoggedIn,isReviewauthor, wrapAsync(reviewController.destroyReview));

module.exports= router;
