var express = require('express');
var path = require("path");
var app = express();

var port = 8000;

app.use(express.static(path.join(__dirname, 'WebRTCApp')));

app.get('/', (req, res, next) =>{
    res.redirect('/');
});

app.listen(port,() => {
    console.log('Listening in the port %d', port);
});