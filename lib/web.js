var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')


// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

app.listen(process.env.PORT || 8080);

var players = {};
var room = { players: [], paused: true };

function handler (req, res) {
  if (req.url.indexOf('/log?msg=') != -1) {
    console.log(req.url);
  }
  fs.readFile(__dirname + '/../public/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('room', room);
  socket.on('addPlayer', function (player) {
    var playerInRoom = players[player['guid']];
    if (!playerInRoom) {
      playerInRoom = {guid: player['guid'], time: 0};
      players[player['guid']] = playerInRoom;
      room['players'].push(playerInRoom);
    }
    playerInRoom['gravatarHash'] = player['gravatarHash'];
    playerInRoom['name']         = player['name'];

    socket.broadcast.emit('room', room);
    socket.emit('room', room);
  });
});