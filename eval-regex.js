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
    var formula = req.body.formula;
    // Check if there is anything else besides 0-9 - * + /
    if(formula.match(/[^0-9\-\/\*\+]/)) {
        res.status(400).send('Invalid input');
        return;
    }

    var result;
    eval('result = ' + formula);
    res.send('The result is: ' + result);
});

app.listen(3000);