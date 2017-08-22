//SET UP SOCKETS
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
// SOCKET SETUP
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
// Initialize socket object
var socket = io.connect('http://localhost:8001');

// Upon establishing connection, log it
socket.on("connectionEstablished", function(data) {
    console.log("Message from the server arrived")
    console.log(data);
});

socket.emit('amISignedUp', {field1: 'am I signed up?'});

socket.on('signedUpResponse', function(data) {
    console.log('signed up successfully', data.field1);
    if(data.field1 == true) {
        alert('signed up successfully');
   
    }
});


// FIX NAVIGATION BAR ACCORDING TO LOGGED IN OR NOT
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
var user;
$.ajax({
    type:   'GET',
    url:    'http://localhost:8001/user'
}).done(function(response) {
    console.log(response);
    user = response.user;
    // if we are logged in (req.user existed) then change the menu to show the name of the user
    console.log('\n\nuser:', user, '\n\n');
    if(user) {
        console.log('user exists because we have user: ', user)
        var li = document.createElement("li");              // create new nav list item
        li.setAttribute('role', 'presentation');            // attribute needed for bootstrap
        li.innerHTML = `<a href="/settings">${user.first_name}</a>`;    // give it a link and the user name
        var navBar = document.getElementById('my-nav-bar'); // get the nav menu to append to
        navBar.appendChild(li);                             // append new li to it
        
        //Now add the logout tab
        var li2 = document.createElement('li');
        li2.setAttribute('role', 'presentation');
        li2.innerHTML = `<a href="/logout">Logout</a>`;
        navBar.appendChild(li2);

        //Now remove the sign up tab
        navBar.removeChild(document.getElementById('signup-tab'));
    }
});




