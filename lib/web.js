var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var path = require('path');

// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

server.listen(process.env.PORT || 8080);

var publicpath = path.normalize( __dirname + "/../public");
app.use(express.static(publicpath));

var players = {};
var room = { players: [], state: 'ready' };
var currentPlayer = 0;

io.sockets.on('connection', function (socket) {
  socket.emit('room', room);
  socket.on('addPlayer', function (player) {
    var playerInRoom = players[player['guid']];
    if (!playerInRoom) {
      playerInRoom = {guid: player['guid']};
      players[player['guid']] = playerInRoom;
      room['players'].push(playerInRoom);
    }
    playerInRoom['gravatarHash'] = player['gravatarHash'];
    playerInRoom['name']         = player['name'];
    playerInRoom['millis']       = 0;

    socket.broadcast.emit('room', room);
    socket.emit('room', room);
  });

  socket.on('start', function (guid) {
    startClock(socket, currentPlayer);
  });

  socket.on('next', function (guid) {
    stopClock(socket, currentPlayer);
    currentPlayer = (currentPlayer + 1) % room['players'].length;
    startClock(socket, currentPlayer);
  });

  socket.on('stop', function (guid) {

  });

  socket.on('pause', function (guid) {

  });

  socket.on('resume', function (guid) {

  });

});

var timerStarted = null;
var intervalId = null;

var startClock = function (socket, player) {
  room['state'] = 'active';
  timerStarted = Date.now();
  intervalId = setInterval(timerUpdate, 100, socket);
  room['players'][currentPlayer]['active'] = true;
  socket.broadcast.emit('room', room);
  socket.emit('room', room);  
};

var stopClock = function (socket, player) {
  delete room['players'][currentPlayer]['active'];
  clearInterval(socket, intervalId);
  timerUpdate(socket);
  intervalId = null;
  timerStarter = null;
};

var timerUpdate = function(socket) {
  var beforeSeconds = Math.floor(room['players'][currentPlayer]['millis'] / 1000);
  var now = Date.now();
  room['players'][currentPlayer]['millis'] = room['players'][currentPlayer]['millis'] + now - timerStarted; 
  var afterSeconds = Math.floor(room['players'][currentPlayer]['millis'] / 1000);
  timerStarted = now;

  if (afterSeconds > beforeSeconds) {
    socket.broadcast.emit('room', room);
    socket.emit('room', room);
  }

  return true;
};