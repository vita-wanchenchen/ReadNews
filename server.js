var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var handlebars = require("express-handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware
// Logging request
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Setting Handlebars
app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/bbc-technews", { useNewUrlParser: true });

// Check connection status
var db = mongoose.connection;
db.on("error", function(error) {
  console.log("Database Error:", error);
});

require("./routes/routes.js")(app);

  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  