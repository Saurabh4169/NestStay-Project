const mongoose = require("mongoose");
const Listing = require("../Models/listing.js");
const initData = require("./data.js");
const methodOverride = require("method-override");



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
  console.log("connected to db")
}).catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data=initData.data.map((obj)=>({...obj,owner:"68bb58c80128aad4acfafe28"}));
  await Listing.insertMany(initData.data);
  
  console.log("data was initialised");
};

initDB();
