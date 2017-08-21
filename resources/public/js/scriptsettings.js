// SOCKET SETUP
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
// Initialize socket object
var socket = io.connect('http://localhost:8001');

// Upon receiving a message
socket.on("connectionEstablished", function(data) {
    console.log("Message from the server arrived")
    console.log(data);
    $('#fromServer').append('<div>' + data.field1 + '</div>');
})

socket.on("loginMsg", function(data) {
    console.log("login msg")
    console.log(data);
    $('#fromServer').append('<div>' + data.field1 + '</div>');
})






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
        li.setAttribute('class', 'active');                 // highlight active tab
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






updateEtherValue();
var currentHue = 0;

// SETTING UP BUTTON EVENT LISTENERS
$('#leftUpdateButton').on('click', updateLeft)
$('#rightUpdateButton').on('click', updateRight)

function updateLeft() {
    var leftTextValue = parseFloat($('#leftTextArea')[0].value);
    $('#leftThreshold')[0].innerText = leftTextValue;
}

function updateRight() {
    var rightTextValue = parseFloat($('#rightTextArea')[0].value);
    $('#rightThreshold')[0].innerText = rightTextValue;
}



// ----------------------------------------------------
// REPEATING REQUESTS
// ----------------------------------------------------

// UPDATE ETHER VALUE
var eth = 0;
setInterval("updateEtherValue()", 60000);

function updateEtherValue() {
    $.getJSON('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=YourApiKeyToken')
     .done(function(response) {
          eth = response.result.ethusd;
          $('#currentValue')[0].innerText = eth;
     })
}

// CHECK LOWER THRESHOLD
setInterval("checkLeftThreshold()", 60000)           //CHANGE BACK TO 60000

function checkLeftThreshold() {
    var currentValue = parseFloat($('#currentValue')[0].innerText);
    var lowerThreshold = parseFloat($('#leftThreshold')[0].innerText);
    if(currentValue <= lowerThreshold) {
        console.log("hit lower bound");
        if(areLightsOn) {
            currentHue = getCurrentHue();
            setTimeout(lightsRed, 300);
            setTimeout(flashLights, 1000);
            setTimeout(lightsCustomHue.bind(null, currentHue), 2500) ;
        }
        else {
            lightsOn();
            currentHue = getCurrentHue();
            setTimeout(lightsRed, 300);
            setTimeout(flashLights, 1000);
            setTimeout(lightsCustomHue.bind(null, currentHue), 2500) ;
            lightsOff();
        }
    }
}



// CHECK UPPER THRESHOLD
setInterval("checkUpperThreshold()", 60000)          //CHANGE BACK TO 60000

function checkUpperThreshold() {
    var currentValue = parseFloat($('#currentValue')[0].innerText);
    var upperThreshold = parseFloat($('#rightThreshold')[0].innerText);
    if(currentValue >= upperThreshold) {
        //alert("Hit Upper Bound");
        if(areLightsOn) {
            currentHue = getCurrentHue();
            setTimeout(lightsGreen, 300);
            setTimeout(flashLights, 1000);
            setTimeout(lightsCustomHue.bind(null, currentHue), 2500) ;
        }
        else {
            lightsOn();
            currentHue = getCurrentHue();
            setTimeout(lightsGreen, 300);
            setTimeout(flashLights, 1000);
            setTimeout(lightsCustomHue.bind(null, currentHue), 2500) ;
            lightsOff();
        }
    }
}








//AJAX CALLS TO BRIDGE
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
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

function lightsOn() {
    $.ajax({
        type: 'PUT',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3/action',
        data: '{"on":true}',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response));
    });
}

function lightsRed() {
    $.ajax({
        async: false,
        type: 'PUT',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3/action',
        data: '{"hue":0}',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response));
    });
}

function lightsGreen() {
    $.ajax({
        type: 'PUT',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3/action',
        data: '{"hue":25500}',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response));
    });
}

function lightsCustomHue(hue) {
    var bodyData = '{"hue":' + hue + '}';
    $.ajax({
        async: false,
        type: 'PUT',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3/action',
        data: bodyData,
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response));
    });
}

function getCurrentHue() {
    var hueNow = 0;
    $.ajax({
        async: false,
        type: 'GET',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response.action.hue));
        hueNow = parseFloat(JSON.stringify(response.action.hue));
    });
    return hueNow;
}

function flashLights() {
    $.ajax({
        type: 'PUT',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3/action',
        data: '{"alert":"select"}',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response));
    });
}

function areLightsOn() {
    $.ajax({
        type: 'GET',
        url: 'http://192.168.1.54/api/hnpWKAUC0llMVOzIwfVnnjOfuGQ1aLF0Q6uNaGDn/groups/3',
        async: false
    })
    .done(function(response) {
        console.log(JSON.stringify(response.state.all_on));
    });
}