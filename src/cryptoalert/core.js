//      Author: Armando Toledo
//      Last Updated: 8/17/17
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

//IMPORTS
//================================================================================================
var express = require('express');                   // Import express
var app = express();                                // Initialzie express object
var path = require('path');                         // Useful for working with paths in express
require('dotenv').config({path: __dirname + '/./../../.env'});     // Read environment variables from .env
var bodyParser = require('body-parser');            // Parse body params
var passport = require('passport');                 // For logging in
var LocalStrategy = require('passport-local').Strategy;  // For logging in




//LOGIN SETUP
//================================================================================================
var records = [
    { id: 1, username: 'jack', password: 'secret', displayName: 'Jack', email: 'jack@example.com'}
  , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', email: 'jill@example.com'}
];

findById = function(id, cb) {
  process.nextTick(function() {
      console.log('XXXXXXXXaaaaaXXXXXXXXXXXXXXX');
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

findByEmail = function(email, cb) {
    console.log('XXXXXXXXXbbbbbXXXXXXXXXXXXXX');
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.email === email) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}



// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy(
    {
    usernameField: 'email',
    // passwordField: 'passwd',
    session: false},
    function(email, password, cb) {
    findByEmail(email, function(err, user) {
        console.log('XXXXXXXXXXXccccccXXXXXXXXXXXX');
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (user.password != password) { return cb(null, false); }
        return cb(null, user);
    });
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    console.log('XXXXXXXXXXddddddXXXXXXXXXXXXX');
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  findById(id, function (err, user) {
      console.log('XXXXXXXXXXXeeeeeeXXXXXXXXXXXX');
    if (err) { return cb(err); }
    cb(null, user);
  });
});






//SERVER SETUP
//================================================================================================
app.use(require('morgan')('combined'));             // for logging in
app.use(require('cookie-parser')());                // for logging in
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(bodyParser.json());                         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
app.set('port', (process.env.PORT || 8001));        // set port
// initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());



//routes
//------------------
app.get('/', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/homepage.html'))});   
app.get('/btc', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/btc.html'))});     
app.get('/login', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/login.html'))}); 

app.post('/login',   passport.authenticate('local',{failureRedirect:'/'}),   function(req, res) {console.log('logged in');res.redirect('/');});

// app.post('/login', function(req, res) {console.log(req.body.password, req.body.email);
//                                        res.sendFile(path.join(__dirname + '/./../../resources/public/login.html'))});
app.get('/logout',  function(req, res){req.logout(); res.redirect('/'); console.log('logged out xxxxx')});  // logout

app.get('/settings', require('connect-ensure-login').ensureLoggedIn() ,  function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/settings.html'))}); 
app.get('/profile',  require('connect-ensure-login').ensureLoggedIn(),  function(req, res){res.render('profile', { user: req.user });}); //settings requires login
//app.get('/settings.html', function(req, res) {res.redirect('/')});



//------------------
app.use(express.static(__dirname + '/./../../resources/public'));      // serve files (after gets for redirects to work)



// start the server
//------------------
app.listen(app.get('port'), function(){console.log('running on port: ', app.get('port'))})  //start listening









