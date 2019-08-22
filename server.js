// server.js
// where your node app starts

// init project
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
mongoose.connect(process.env.DB);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});


//Database stuff
const userSchema = new mongoose.Schema({
  username: {type: String, required: true}
});

const exerSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: Date,
  userId: {type: mongoose.Schema.ObjectId, required: true}
});

const User = mongoose.model("User", userSchema);
const Exer = mongoose.model("Exercise", exerSchema);

//API stuff
app.post("/api/exercise/new-user", function(req, res){
  User.create({username: req.body.username}, function(err, data){
    if(err){
      res.json(err);
    }else{
      res.json(data);
    }
  });
});

app.post("/api/exercise/add", function(req, res){
  Exer.create(req.body, function(err, data){
    if(err){
      res.json(err);
    }else{
      res.json(data);
    }
  });
});

app.get("/api/exercise/log", function(req, res){
  if(req.query.userId===undefined){
    res.send("Specify user id");
  }else{
    
    let from = req.query.from;
    let to = req.query.to;
    //massive if-tree for the cases of from and to queries
    let fromto = function(from, to){
      if(from !== undefined){
        if(to !== undefined){
          return { date: { $gte: from, $lte: to } }
        }else{
          return { date: { $gte: from } }
        }
      }else{
        if(to !== undefined){
          return { date: { $lte: to } }
        }else{
          return null;
        }
      }
    }
    
    //req.query.from !== undefined ? from = (req.query.from) : from = null;
    //req.query.to !== undefined ? to = (req.query.to) : to = null;
    let query = {
     userId: req.query.userId
    };
    Exer.find(query).where(fromto()).sort("-date").limit(parseInt(req.query.limit)).exec(function(err, data){
      if(err){
        res.json(err);
      }else{
        res.json(data);
      }
    })
  }
  
});