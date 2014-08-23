var express = require('express');
var app = express();

app.get('/', function(req, res){
  	res.sendFile(__dirname+'/client/index.html');
});

app.get('/noktime.css', function(req, res){
  	res.sendFile(__dirname+'/client/noktime.css');
});

app.get('/noktime.js', function(req, res){
  	res.sendFile(__dirname+'/client/noktime.js');
});


var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});