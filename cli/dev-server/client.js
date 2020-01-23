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


//shows the error message
function showerror (errormsg, file){
    var container = document.createElement("div");
    var header = document.createElement("h1");
    header.textContent = errormsg;
    container.appendChild(header);
    var atfile = document.createElement("p");
    atfile.textContent = file;
    container.appendChild(atfile);
    document.head.insertAdjacentHTML("beforeend", "<style>" + css + "</style>");
    document.getElementsByTagName("body")[0].appendChild(container)
}

addEventListener("error", function(ev){
   showerror(ev.error, ev.filename) 
});
//Lauri
var socket = new WebSocket("ws://localhost:{{ port }}");

socket.onopen = function() {
    alert("[Auto Refresh] Connection established");
};

socket.onmessage = function(ev) {
    var msg = ev.data;
    console.log("Recieved from the server: " + msg);
    if(msg.startsWith("error:")) {
        var json = msg.replace("error:","");
        var error = JSON.parse(json);
        showerror(error.error, error.file)
    } else {
        location.reload(true);
    }
};

socket.onclose = function(ev) {
    console.log("[Auto Refresh] connection closed because: " + ev.reason);
};

socket.onerror = function(error) {
    console.error(`[Auto Refresh] ${error.message}`);
}; //© Lauri Särkioja 2020