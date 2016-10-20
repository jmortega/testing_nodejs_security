var express = require('express');
var app = express();

// The next line tells the server to make files under public directory accessible.
app.use(express.static('public'));

// Define callback for the root path
app.get('/', function(req, res){
    res.send('hello world');
});

app.listen(3000);