var cookieParser = require('cookie-parser');
var easySession = require('easy-session');
var session = require('express-session');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();


var db = {
	_index: 1,
    1:{
        username: 'admin',
        password: 'pwa',
        name: 'Admin',
        company: 'Mine',
        isAdmin: 1
    }
};

function matchUsernamePassword(username, password) {
    if(!username || !password) {
        return {success:false, error: 'Missing username or password'};
    }
    var userId;
    Object.keys(db).some(function (id) {
        if(db[id].username === username) {
            userId = id;
            return true;
        }
    });
    if(!userId || db[userId].password !== password) {
        return {success: false, error: 'Wrong username or password'};
    }
    return {success: true, userId: userId};
}



app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(easySession.main(session));

// Show a welcome message
app.get('/', function (req, res, next) {
    res.send('<h1>Welcome</h1><a href="/register">Register</a><br/><a href="/login">Login</a><br/><a href="/users">Users</a>');
});

// Show registration form
app.get('/register', function (req, res, next) {
    var form = '<form method="POST">' +
        '<input type="text" name="username" placeholder="username" />' +
        '<input type="text" name="name" placeholder="name" />' +
		'<input type="password" name="password" placeholder="password" />' +
        '<input type="text" name="company" placeholder="company" />';
    // If logged in then show admin checkbox
    if(req.session.isLoggedIn()) {
        form += '<label for="isAdmin">Is Admin? ' +
        '<input id="isAdmin" type="checkbox" name="isAdmin" value="1" /></label>';
    }
    form += '<input type="submit" value="Submit" />' +
    '</form>';

    res.send(form);
});

// Post request handler
app.post('/register', function (req, res, next){
    var newUser = {
        username: req.body.username,
		password: req.body.password,
        name: req.body.name,
        company: req.body.company,
        isAdmin: req.body.isAdmin || 0 // if no isAdmin is sent then set to 0
    };
    db[++db._index] = newUser;

    console.log(db); // show us the users
    res.redirect('/');
});

// Our admin function to show users
app.get('/users', function (req, res, next) {
    var html = '<pre>' + JSON.stringify(db, '', 2) +'</pre>';
    res.send(html);
});

app.get('/logout', function (req, res) {
    req.session.logout(function () {
        res.redirect('/');
    });
});

// Middleware to validate that users are authenticated
/*app.all('*', function (req, res, next) {
    if(req.session.isGuest()) {
        res.send(401);
        return;
    }
    next();
});*/

app.get('/settings/:id?*', function (req, res) {
    // If there is no GET parameter
	console.log(req.params.id)
	console.log(req.session.userId)
    if(req.params.id) {
        // Use session variable instead of a GET variable
        res.json(db[req.session.userId]);
        return;
    }
    // If we are accessing our own info or we are admin
    if(req.session.userId === +req.params.id ||
        db[req.session.userId].username === 'admin'){

        res.json(db[req.params.id]);
        return;
    }
    res.send(401); // unauthorized
});

app.get('/login', function(req, res){
    if(!req.session.isGuest()) { // if the user is logged in then redirect to their home
        res.redirect('/user/' + req.session.userId);
        return;
    }
    var form = '<form method="POST" action="/login">' +
        '<input type="text" name="username" placeholder="username" />' +
        '<input type="password" name="password" placeholder="password" />' +
        '<input type="submit" value="Login" />' +
        '</form>';
    if(req.session.error) { // If we had an error then show it
        form += '<div>' + req.session.error + '</div>';
    }
    req.session.error = null; // Delete error.
    res.send(form);
});

app.post('/login', function (req, res) {
    var valid = matchUsernamePassword(req.body.username, req.body.password);
	console.log(valid.success)
    if(valid.success) { // Validation success. Create authorized session.
        req.session.login(function () {
            req.session.userId = valid.userId;
            res.redirect('/settings/' + valid.userId);
        });
    } else {
        req.session.error = valid.error;
        res.redirect('/');
    }
});

app.listen(3000);