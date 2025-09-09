if(process.env.NODE_ENV!="production")
require('dotenv').config()
//console.log(process.env.SECRET);

console.log(process.env.SECRET);
const express = require("express");
const MongoStore=require('connect-mongo');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy=require("passport-local");
const User=require("./Models/user.js");
const userRouter=require("./routes/user.js");

// ----------------- DB CONNECTION -----------------
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// ----------------- APP SETUP -----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
    
  },
touchAfter:24*3600,

})

// ----------------- SESSION + FLASH -----------------

store.on("error",()=>{
  console.log("error  in session",err);
});
const sessionOption = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,   // ✅ fixed typo
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

// implemet passport 
app.use(passport.initialize());
app.use(passport.session());
//login signup auntneticate by this below line
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");   // ✅ this is required
  res.locals.currUser=req.user;
  next();
});

app.get("/demouser",async(req, res)=>{
  let fakeUser= new  User({
    email:"student@gmail.com"
    ,
    username:"deltaStudent"
   
  });
   let registerUser=await User.register(fakeUser,"helloWorld");
   res.send(registerUser);
});



// ----------------- ROUTES -----------------
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", userRouter);

// ❌ REMOVE duplicate review routes from here
// (they are already handled in routes/review.js)

// ----------------- ERROR HANDLERS -----------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ----------------- SERVER -----------------
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
