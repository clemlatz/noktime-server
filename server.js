var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/client'));

var server = app.listen(app.get('port'), function() {
    console.log('Listening on port %d', app.get('port'));
});
