var eth = 0;

setInterval(postEtherValue, 5000);

function postEtherValue() {
    function reqListener () {
        console.log(this.responseText);
        postMessage(this.responseText);
    }

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "http://httpbin.org/get");
    oReq.send();
}