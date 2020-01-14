//this file will be executed on the frontend!
//Tapio

var css = `
body {
    background-color:rgb(27, 27, 27);
}

header {
    font-family: Arial;
    font-size: 30px;
    color: red;
    margin-top: 20px;
    margin-left: 150px;
}

#file {
    font-family: arial;
    font-size: 22px;
    text-align: left;
    margin-left: 150px;
    color: white;
}`;

var template = `
<header>Error: errormsg</header>
<div id="file">
    <p> file1</p>
</div>`;

addEventListener("error", function(ev){
    var message = ev.message;
    var file = ev.filename;
    var t = template.replace("errormsg", message).replace("file1", file);
});


//Lauri
var socket = new WebSocket("localhost:{{ port }}");

socket.onopen = function() {
    alert("[Auto Refresh] Connection established");
};

socket.onmessage = function(ev) {
    var msg = ev.data;
    
};

socket.onclose = function(ev) {
    if (ev.wasClean) {
        alert(`[close] Connection closed cleanly, code=${ev.code} reason=${ev.reason}`);
    } else {
        alert('[close] Connection is dead!');
    }
};

socket.onerror = function(error) {
    alert(`[error] ${error.message}`);
};