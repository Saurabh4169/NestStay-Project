const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");   // ✅ Missing import

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
      url:String,
      filename:String
    },   // ✅ Extra closing brace was wrong in your code
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    }
  ],
  owner: {
  type: Schema.Types.ObjectId,
  ref: "User"
},
 geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      //default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  // category:{
  //   type:[Number],
  //   enum:["moutains","arctic","farms","deserts"],
  // }

});

// 🔥 Cascade Delete: when a listing is deleted, delete all its reviews too
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
