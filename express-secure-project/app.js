var express = require('express'),
  path = require('path'),
  logger = require('morgan'), //log module
  favicon = require('serve-favicon'),
  errorhandler = require('errorhandler'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session');

var csrf = require('csurf'),
  helmet = require('helmet'),
  validator = require('express-validator');

var bcrypt = require('bcrypt-nodejs');


var app = express();

app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(logger('combined'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static('public'));
app.use(cookieParser('FE28D342-4040-4D0E-B080-B85E85DAF7FD'));
app.use(session({
  secret: 'BD564488-5105-4202-8927-5A5C9AE9154E',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(validator());
app.use(function(request,response,next){
	for(var item in request.body){
		request.sanitize(item).escape();
	}
	next();	
});

app.use(csrf());
app.use(function (request, response, next) {
  response.locals.csrftoken = request.csrfToken();
  next();
});

app.disable('x-powered-by');

app.use(helmet());
//app.use(helmet.xframe());
//app.use(helmet.iexss());
//app.use(helmet.contentTypeOptions());
//app.use(helmet.cacheControl());

app.get('/', function(request, response){
  response.render('index');
});

app.post('/login-custom', function(request, response){
  var errors = [];
  var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!request.body.password) errors.push({msg: 'Password is required'});
  if (!request.body.email){
	errors.push({msg: 'Email is required'});
  }
  if(!emailRegExp.test(request.body.email) ){
	errors.push({msg: 'A valid email is required'});
  }
  if (errors)
    response.render('index', {errors: errors});
  else
    response.render('login', {email: request.body.email});
});


app.post('/login', function(request, response){
  request.assert('password', 'Password is required').notEmpty();
  request.assert('email', 'A email is required').notEmpty();
  request.assert('email', 'A valid email is required').isEmail();
  var errors = request.validationErrors();
  if (errors)
    response.render('index', {errors: errors});
  else{
    console.log(request.body.email);
	console.log(request.body.password);
	hashPassword(request.body.password,function(error,hash){
		console.log('hash'+hash);
		response.render('login', {email: request.body.email,passwordHash: hash});
	});
	}
});

app.post('/validateHash', function(request, response){
  request.assert('password', 'Password is required').notEmpty();
  request.assert('hash', 'Hash is required').notEmpty();
  var errors = request.validationErrors();
  if (errors)
    response.render('login', {errors: errors});
  else{
    console.log(request.body.password);
	console.log(request.body.hash);
	veriffyPasword(request.body.password,request.body.hash,function(error,isMatch){
		console.log('isMatch'+isMatch);
		response.render('login', {isMatch: isMatch});
	});
	}
});

app.use(errorhandler());

var server = app.listen(app.get('port'), function() {
  //console.log('Express server listening on port ' + server.address().port);
  console.log("Express server listening on port %d in mode %s", server.address().port, app.get('env'));
});

var hashPassword = function(password,callback){
	bcrypt.genSalt(10,function(err,salt){
		if(err){
			console.log('error'+err);
			callback(err);
		}
		bcrypt.hash(password,salt,null,function(err,hash){
			if(err){
				console.log('error'+err);
				callback(err);
			}
			callback(null,hash);
		});
	});	
};

var veriffyPasword = function(password,hash,callback){
	bcrypt.compare(password,hash,function(err,isMatch){
	if(err) return callback(err);
	callback(null,isMatch);
});
};
