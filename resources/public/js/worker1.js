var myVar = 1;

function doWork() {
    postMessage('x');
}

setInterval("doWork()", 1000);

