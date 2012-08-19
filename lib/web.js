var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')


// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

app.listen(8080);

var room = { players: [] };

function handler (req, res) {
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
  socket.on('addPlayer', function (name) {
    room['players'].push({name: name, time: 0});
    socket.broadcast.emit('room', room);
    socket.emit('room', room);
  });
});