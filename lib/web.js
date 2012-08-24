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
var room = { players: [], paused: true };

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