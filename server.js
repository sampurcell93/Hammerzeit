// Generated by CoffeeScript 1.6.3
(function() {
  var app, db, express, mongo, port;

  express = require("express");

  app = express();

  mongo = require('mongodb');

  db = require("mongojs").connect("mongodb://127.0.0.1/Hammerzeit", ["players"]);

  port = process.env.PORT || 5000;

  app.listen(port, function() {
    return console.log("listening on " + port);
  });

  app.configure(function() {
    app.use(express.logger("dev"));
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    return app.use(express["static"](__dirname + "/public"));
  });

  app.get("/", function(req, res) {
    return res.render("index");
  });

  app.post("/user", function(req, res) {
    var password, username;
    password = req.body.password;
    username = req.body.username;
    console.log(username, password);
    return res.json({
      success: true
    });
  });

}).call(this);
