const path = require("path");
const mongoose = require("mongoose");
const express = require("express");
var bodyParser = require("body-parser");
const socketIO = require("socket.io");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

let port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = socketIO(server);

const dbURI = process.env.CONNECTION_STRING;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

mongoose
  .connect(dbURI, options)
  .then(() => {
    console.log("Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

var generalSchema = new mongoose.Schema({}, { strict: false });
var PlayersData = mongoose.model("players-details", generalSchema);
var CommentData = mongoose.model("players-comments", generalSchema);

io.on("connection", (socket) => {
  socket.on("newCommentAdded", (eventObject) => {
    io.emit(eventObject.nextEvent, {
      message: "New Comment Added! Updating Data!!",
      playerId: eventObject.playerId,
    });
  });
  socket.on("newPlayerAdded", (eventObject) => {
    io.emit(eventObject.nextEvent, {
      message: "New Player Added! Updating Data!!",
      playerId: eventObject.playerId,
    });
  });
});

// Get All Teams Players
app.get("/getAll", async (req, res) => {
  var data = await PlayersData.find();
  data = JSON.parse(JSON.stringify(data));
  res.send(data);
});

// Get Player
app.get("/getTeam", async (req, res) => {
  var data = await PlayersData.find({ team: req.query.team });
  if (data.length > 0) {
    data = JSON.parse(JSON.stringify(data[0]));
  }
  res.send(data);
});
// Get Comment
app.get("/getComments", async (req, res) => {
  var data = await CommentData.find({ team: req.query.team });
  data = JSON.parse(JSON.stringify(data[0]));
  res.send(data);
});

// Add Player
app.post("/addPlayer", async (req, res) => {
  var playerMain = req.body.player;
  var playerComment = {
    id: req.body.player.id,
    playerName: req.body.player.playerName,
    comments: [],
  };
  var code = req.body.code;
  var resp = { error: "Wrong Password" };
  if (code == "345235") {
    var res1 = await PlayersData.updateOne(
      { team: playerMain.from.toLowerCase() },
      { $push: { players: playerMain } }
    );
    var res2 = await CommentData.updateOne(
      { team: playerMain.from.toLowerCase() },
      { $push: { players: playerComment } }
    );
    resp = { res1, res2 };
  }
  res.send(resp);
});

// Add Comment
app.post("/postComment", async (req, res) => {
  var comment = {
    personName: req.body.personName,
    comment: req.body.comment,
  };
  var playerId = req.body.playerId;
  var playerTeam = req.body.team;
  var data = await CommentData.find({ team: playerTeam });
  data = JSON.parse(JSON.stringify(data[0]));
  data.players[playerId].comments.push(comment);
  var respan = await CommentData.updateOne(
    { team: playerTeam },
    {
      $set: { players: data.players },
    }
  );
  res.send(respan);
});

server.listen(port, () => {
  console.log(`Server Started at port ${port}`);
});
