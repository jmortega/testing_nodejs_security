var express = require('express');

var session = require('express-session');

var cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser());

app.use(session({

secret: 'my secret',

resave: false,

saveUninitialized: true

}));

app.get('/', function(req, res){

if(!req.session.views) {

req.session.views = 0;

}

req.session.views++;

res.send('this page has been visited. ' + req.session.views + ' times');

});

app.listen(3000);

