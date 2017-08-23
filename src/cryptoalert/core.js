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
var justSignedUp = false;                           // For announcing successful sing up
var userData = {}                                   // For giving client it's user data
var db = require('mysql');






//DATABASE SETUP
//================================================================================================
var connection = db.createConnection({
  host:process.env.DB_HOSTNAME,
  user:process.env.DB_USERNAME,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  port:process.env.DB_PORT
})

console.log(process.env.DB_HOSTNAME);





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
    var query = `SELECT * FROM trader WHERE email='${email}';`;
    console.log('\n\nquery for find email is:\n', query);
    var record;
    connection.query(query, function(error, rows, fields) {
      if(error) {
        console.log(error);
      }
      console.log('\n\nrows is:\n', rows);
      console.log('\n\nrows[0] is:\n', rows[0]);
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
// get
//========
app.get('/', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/homepage.html'))});
app.get('/homepage', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/homepage.html'))});
app.get('/btc', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/btc.html'))});
app.get('/signup', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/signup.html'))});
app.get('/logout',  function(req, res){  req.logout(); res.redirect('/'); justLoggedOut = true;  });  // logout
app.get('/settings', require('connect-ensure-login').ensureLoggedIn() ,  function(req, res) {
  userData = req.user;  // load user data to send through socket upon request
  res.sendFile(path.join(__dirname + '/./../../resources/public/settings.html'))}); //server the view
app.get('/profile',  require('connect-ensure-login').ensureLoggedIn(),  function(req, res){res.render('profile', { user: req.user });}); //settings requires login
app.get('/user', function(req, res) {res.send({user:req.user});});
app.get('/login', function(req, res) {res.sendFile(path.join(__dirname + '/./../../resources/public/login.html'))});
app.get('/failedlogin', function(req, res) {res.sendFile(path.join(__dirname + './../../resources/public/failedlogin.html'))});

// post
//============
 // post signup
app.post('/signup', function(req, res) {
  console.log('\n\n\n\nbody:\n',req.body,'\n\n\n\n\n\n');
  var cool = req.body.cool;
  if(cool == 'y'){cool = 'Y'} if(cool == 'n'){cool = 'N'}
  var queryAddTrader = `INSERT INTO trader (email, first_name, last_name, password, cool) VALUES ('${req.body.email}', '${req.body.first_name}', '${req.body.last_name}', '${req.body.password}', '${cool}');`;
  console.log('will try to add to query\n', queryAddTrader);
  connection.query(queryAddTrader, function(error, rows, columns) {
    if(error){console.log(error); return;}; // if error return immediatelly
    console.log('\n\n\nquery result rows: ',rows);
    console.log('\n\n\nquery result columns: ',columns);
    justSignedUp = true;
    res.redirect('/login');
  });
});

// post login
app.post('/login', passport.authenticate('local',{failureRedirect:'/failedlogin'}),  function(req, res) {
  console.log('\n\n', req.body.email, req.body.password, '\n\n');
  console.log('logged in');
  justLoggedIn = true;
  setTimeout(function(){justLoggedIn = false}, 3000);           // reset justLoggedIn to false
  res.redirect('/settings');});

// post settings
app.post('/settings', function(req, res) {
  var first_name, last_name, password, cool, twit_acc, phone, ethlow, ethhigh, btclow, btchigh; // placeholders
  var strArr = [];  // vector to create long string
  //check which fields were updated by client and push them to the vector strArr
  if(req.body.first_name) {first_name = `first_name='` + req.body.first_name + `'`; strArr.push(first_name)};
  if(req.body.last_name) {last_name = `last_name='` + req.body.last_name + `'`; strArr.push(last_name)};
  if(req.body.password) {password = `password='` + req.body.password + `'`; strArr.push(password)};
  if(req.body.cool) {cool = `cool='` + req.body.cool + `'`; strArr.push(cool)};
  if(req.body.twit_acc) {twit_acc = `twit_acc='` + req.body.twit_acc + `'`; strArr.push(twit_acc)};
  if(req.body.phone) {phone = `phone='` + req.body.phone + `'`; strArr.push(phone)};
  if(req.body.ethlow) {ethlow = `ethlow=` + req.body.ethlow; strArr.push(ethlow)};
  if(req.body.ethhigh) {ethhigh = `ethhigh=` + req.body.ethhigh; strArr.push(ethhigh)};
  if(req.body.btclow) {btclow = `btclow=` + req.body.btclow; strArr.push(btclow)};
  if(req.body.btchigh) {btchigh = `btchigh=` + req.body.btchigh; strArr.push(btchigh)};

  //LOGGING DELETE
  console.log(strArr);

  //join the received fields with a comma into the string queryFields
  var queryFields = strArr.join(', ');

  //LOGGING DELETE
  console.log('\n\n\n\n\n\nqueryFields:\n');
  console.log(queryFields);
  console.log('\n\n\n\n\n\n\n');
  //LOGGING DELETE
  console.log('\n\n\n\n\n\n\n');
  console.log(req.body);
  console.log('\n\n\n\n\n\n\n');
  console.log(Object.keys(req.body));

  // create the full query string to query the db
  var fullQuery = 'UPDATE trader SET ' + queryFields + ` WHERE email = '` + req.user.email + `'`;

  //LOGGING DELETE
  console.log('\n\n\n\n\n\nfullquerystring:\n');
  console.log(fullQuery);
  console.log('\n\n\n\n\n\n\n');

  // query the database
  connection.query(fullQuery, function(error, rows, columns) {
    if(error){
      console.log(error);
    }
    console.log('\nrows:', rows);
    console.log('\ncolumns:', columns);
  });

  userData = req.user;  // load user data to send through socket upon request
  res.redirect('/settings'); // redirect to same page after posting
});
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

  // upon client request to learn if log in was successful, respond with the answer
  socket.on('didIJustLogIn', function(data) {
    console.log('\n\nclient is requesting log in info\n\n');      // log that the event triggered
    console.log('responding back with variable justLoggedIn which = ', justLoggedIn); // logging value of justLoggedIn
    socket.emit('loggedInResponse', {field1: justLoggedIn});    // respond to client with value of justLoggedIn
  });

  // upon client request to learn if log out was successful, respond with the answer
  socket.on('didIJustLogOut', function(data) {
    console.log('\n\nclient is requesting log out info\n\n');      // log that the event triggered
    console.log('responding back with variable justLoggedOut which = ', justLoggedOut); // logging value of justLoggedOut
    socket.emit('loggedOutResponse', {field1: justLoggedOut});    // respond to client with value of justLoggedOut
    setTimeout(function(){justLoggedOut = false}, 1000);           // reset justLoggedOut to false
  });

  // upon client request to learn if sign up was successful, respond with the answer
  socket.on('amISignedUp', function(data) {
    console.log('\n\nclient is requesting log out info\n\n');      // log that the event triggered
    console.log('responding back with variable justSignedUp which = ', justSignedUp); // logging value of justSignedUp
    socket.emit('signedUpResponse', {field1: justSignedUp});      // respond to the client's request
    setTimeout(function(){justSignedUp = false}, 1000);
  });

  // upon client request to get user data object, send the user data object
  socket.on('userDataRequest', function(data) {
    console.log('\n\nclient is requesting user data object\n\n');      // log that the event triggered
    console.log('responding back with variable userData which = ', userData, '\n\n\n'); // logging value of userData
    socket.emit('userDataResponse', {field1: userData})
  });
});
