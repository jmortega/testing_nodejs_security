var express = require('express');
var fs = require('fs');
var app = express();

var path = require('path');
var root = path.join(__dirname, '/files');

//For avoid path transversal
//You simply need to construct the absolute path and check that it

//Limiting public file access to specific controlled folders or files and always
//constructing and validating absolute paths before actual file access allows
//you to make sure that you’re safe against being overly open with your data.
//starts with the absolute path of your expected public folders.

//Construct absolute path
function getPath(filename) {
    return path.join(root,  filename);
}
//Validate path
function validate(filePath) {
    // Expect the filepath to start with
    // our public root path
    return filePath.indexOf(root) === 0;
}

app.get('/', function (req, res) {
    if(!req.query.file) {
        res.sendStatus(404);
        return;
    }
    var filePath = getPath(req.query.file);
    if(!validate(filePath)) {
        res.sendStatus(404);
        return;
    }
    var stream = fs.createReadStream(filePath);

    //Handle errors
    stream.on('error', function (err) {
        var status = err.code === 'ENOENT' ? 404 : 500;
        res.sendStatus(status);
    });

    stream.pipe(res);
});

app.listen(3000);