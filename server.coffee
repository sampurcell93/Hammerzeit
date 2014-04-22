express = require("express")
app = do express
mongo = require('mongodb');
db = require("mongojs").connect("mongodb://127.0.0.1/Hammerzeit", ["players"]);
# bcrypt = require('bcrypt');


port = process.env.PORT || 5000
app.listen port, ->
    console.log "listening on " + port

app.configure ->
  app.use express.logger("dev")
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.cookieParser()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use express.static(__dirname + "/public")

app.get "/", (req, res) ->
  res.render "index"

app.post "/users/:name", (req, res) ->
  password = req.body.password;
  username = req.params.name;
  db.players.findAndModify({
    query: {username: req.body.username}
    update: {
      $setOnInsert: req.body
    },
    new: true,   
    upsert: true 
  }, (err, updated) => 
      if !err
        res.json username: updated.username
  )

app.get "/users/:name", (req, res) ->
  db.players.findOne {username: req.params.name}, (err, found) ->
    if !err then res.json found

