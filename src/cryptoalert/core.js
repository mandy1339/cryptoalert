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
var socket = require('socket.io');
var justLoggedIn = false;                           // For announcing successful log in
var justLoggedOut = false;                          // For announcing successful log out
var db = require('mysql');






//DATABASE SETUP
//================================================================================================
var connection = db.createConnection({
  host:process.env.DB_HOSTNAME,
  user:process.env.DB_USERNAME,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
})







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

findByEmail2 = function(email, cb) {
  console.log('\n\n\nfindbyemail2 email passed: ', email, '\n\n\n\n')
  process.nextTick(function() {
    var query = 'SELECT * FROM trader WHERE email="mandy1339@gmail.com";';
    var record;
    connection.query(query, function(error, rows, fields) {
      if(rows[0] && rows[0].email === email){
        record = rows[0];
        return cb(null, record);
      }
      else {
        return cb(null, null);
      }
    });  
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
    findByEmail2(email, function(err, user) {
        console.log('XXXXXXXXXXXccccccXXXXXXXXXXXX');
        console.log('\n\nuser: ', user, '\n\n');
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        console.log('\n\nuser: ', user, '\n\n');
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
  cb(null, user.email);
});

passport.deserializeUser(function(email, cb) {
  findByEmail2(email, function (err, user) {
      console.log('XXXXXXXXXXXeeeeeeXXXXXXXXXXXX');
    if (err) { return cb(err); }
    cb(null, user);
  });
});






//SERVER SETUP
//================================================================================================
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


// Routes
//-------------------------------------------------------------------------------------------------------------
app.get('/', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/homepage.html'))});
app.get('/homepage', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/homepage.html'))});
app.get('/btc', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/btc.html'))});     
app.get('/login', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/login.html'))}); 
app.get('/signup', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/signup.html'))}); 

app.post('/login', passport.authenticate('local',{failureRedirect:'/login'}),  function(req, res) {
                                                                                 console.log('\n\n', req.body.email, req.body.password, '\n\n');
                                                                                 console.log('logged in');
                                                                                 justLoggedIn = true;
                                                                                 res.redirect('/');});

// app.post('/login', function(req, res) {console.log(req.body.password, req.body.email);
//                                        res.sendFile(path.join(__dirname + '/./../../resources/public/login.html'))});
app.get('/logout',  function(req, res){req.logout();                                                    // logout
                                        res.redirect('/'); 
                                        console.log('\n\nlogged out xxxxx\n\n');
                                        justLoggedOut = true;}); 

app.get('/settings', require('connect-ensure-login').ensureLoggedIn() ,  function(req, res) {
                                                          res.sendFile(path.join(__dirname + '/./../../resources/public/settings.html'))}); 
app.get('/profile',  require('connect-ensure-login').ensureLoggedIn(),  function(req, res){res.render('profile', { user: req.user });}); //settings requires login
//app.get('/settings.html', function(req, res) {res.redirect('/')});
//--------------------------------------------------------------------------------------------------------------

// Serve files (after gets for redirects to work)
app.use(express.static(__dirname + '/./../../resources/public'));      

// Listen
var server = app.listen(app.get('port'), function(){console.log('running on port: ', app.get('port'))})  //start listening
//================================================================================================






// SOCKET SETUP
//================================================================================================
//================================================================================================
var io = socket(server);
var socketHolder;

io.on('connection', function(socket){
  socketHolder = socket;
  console.log('Socket.io Connection with the client established');
  console.log('Socket id: ' + socket.id);
  // as soon as you establish connection, send a message to client
  socket.emit('connectionEstablished', {field1: 'connection to server established'});

  //upon receiving messages from the client, log it and then respond back
  socket.on('msgFromClient1', function(data){
    console.log(data);
    socket.emit('msgFromServer1', {field1: 'server message no 1'});
  });

  // upon client request to learn if log in was successful, respond with the answer
  socket.on('amILoggedIn', function(data){
    console.log('\n\nclient is requesting log in info\n\n');      // log that the event triggered
    console.log('responding back with variable justLoggedIn which = ', justLoggedIn); // logging value of justLoggedIn
    socketHolder.emit('loggedInResponse', {field1: justLoggedIn});    // respond to client with value of justLoggedIn
    setTimeout(function(){justLoggedIn = false}, 1000);           // reset justLoggedIn to false
  });
  
  // upon client request to learn if log out was successful, respond with the answer
  socket.on('amILoggedOut', function(data){
    console.log('\n\nclient is requesting log out info\n\n');      // log that the event triggered
    console.log('responding back with variable justLoggedOut which = ', justLoggedOut); // logging value of justLoggedOut
    socketHolder.emit('loggedOutResponse', {field1: justLoggedOut});    // respond to client with value of justLoggedOut
    setTimeout(function(){justLoggedOut = false}, 1000);           // reset justLoggedOut to false
  });

});





