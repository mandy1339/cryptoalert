// SOCKET SETUP
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
// Initialize socket object
var socket = io.connect('http://54.89.227.145');

// Upon establishing connection, log it
socket.on("connectionEstablished", function(data) {
    console.log("Message from the server arrived")
    console.log(data);
});

socket.emit('didIJustLogIn', {field1: 'Did I just log in?'});

socket.on('loggedInResponse', function(data) {
    if(data.field1 == true) {
        alert('logged in successfully');
    }
});

socket.emit('didIJustLogOut', {field1: 'Did I just log out?'});

socket.on('loggedOutResponse', function(data) {
    if(data.field1 == true) {
        alert('logged out successfully');
    }
});





// FIX NAVIGATION BAR ACCORDING TO LOGGED IN OR NOT
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
var user;
$.ajax({
    type:   'GET',
    url:    'http://54.89.227.145/user'
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

        // Remove the login tab
        navBar.removeChild(document.getElementById('login-tab'));
    }
});







function lightsOff() {
    $.ajax({
        async: false,
        type: 'PUT',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3/action',
        data: '{"on":false}',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response));
    });
}

















// MARKET INFO SETUP
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
updateEtherValue();
var currentHue = 0;
updateBTCValue(); 
var currentHue = 0;









// ----------------------------------------------------
// REPEATING REQUESTS
// ----------------------------------------------------

// UPDATE ETHER VALUE
setInterval("updateEtherValue()", 60000);

function updateEtherValue() {
    $.getJSON('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=YourApiKeyToken')
     .done(function(response) {
          var eth = response.result.ethusd;
          $('#currentValueEth')[0].innerText = eth;
     })
}

// UPDATE BITCOIN VALUE   
setInterval(updateBTCValue, 60000);

function updateBTCValue() {
 $.ajax({
        url: 'https://api.coinbase.com/v2/exchange-rates',
        method: 'GET',
        dataType: 'json',
		data: {'currency': 'BTC'}
    })
    .done(function(response) {
        var btc = parseFloat(response.data.rates.USD);
        $('#currentValueBtc')[0].innerText = btc;
    })
}
