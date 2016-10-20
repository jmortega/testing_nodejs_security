var express = require('express');
var fs = require('fs');
var app = express();

//http://localhost:3000/?file=hello-world.js
//attackers can use the file system’s upward
//transversal property, ask for /?file=../app.js, and get the contents of app.js.
//With path transversal you could access any file the system

//Construct path
function getPath(filename) {
    return __dirname + '/files/' + filename;
}

app.get('/', function (req, res) {
    if(!req.query.file) {
        res.sendStatus(404);
        return;
    }
    var filePath = getPath(req.query.file);
    var stream = fs.createReadStream(filePath);

    //Handle errors
    stream.on('error', function (err) {
        var status = err.code === 'ENOENT' ? 404 : 500;
        res.sendStatus(status);
    });

    stream.pipe(res);
});

app.listen(3000);