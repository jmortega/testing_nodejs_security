var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.get('/', function(req, res){
    var form = '' +
        '<form method="POST" action="/calc">' +
        '<input type="text" name="formula" placeholder="formula" />' +
        '<input type="submit" value="send" />' +
        '</form>';
    res.send(form);
});

app.use(bodyParser.urlencoded({extended: false}));

app.post('/calc', function (req, res) {
    var result;
    eval('result = ' + req.body.formula);
    res.send('The result is: ' + result);
});

app.listen(3000);