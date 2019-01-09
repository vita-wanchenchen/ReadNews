var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var handlebars = require("express-handlebars");

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
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/bbc-technews";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


// Check connection status
var db = mongoose.connection;
db.on("error", function(error) {
  console.log("Database Error:", error);
});

require("./routes/routes.js")(app);

  app.listen(process.env.PORT || PORT, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
  