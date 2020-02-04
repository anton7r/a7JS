//Tapio

var errorAmount = 0

//shows the error message
function showerror (errormsg, file){
    if(errorAmount > 0) return;
    var container = document.createElement("div");
    container.id = "container";
    var header = document.createElement("h1");
    header.id = "header";
    header.textContent = errormsg;
    container.appendChild(header);
    var atfile = document.createElement("p");
    atfile.id = "file";
    atfile.textContent = file;
    container.appendChild(atfile);
    document.head.insertAdjacentHTML("beforeend", "<style>{{ css }}</style>");
    document.getElementsByTagName("body")[0].appendChild(container)
    errorAmount++
}

addEventListener("error", function(ev){
    var fileName = ev.filename.replace()
   showerror(ev.error, `${ev.filename}:${ev.lineno}`) 
});
//Lauri
var socket = new WebSocket("ws://localhost:{{ port }}");
socket.onopen = () => console.log("[Auto Refresh] Connection established");

socket.onmessage = function(ev) {
    var msg = ev.data;
    if(msg.startsWith("error:")) {
        var json = msg.replace("error:","");
        var error = JSON.parse(json);
        showerror(error.error, error.file)
    } else {
        location.reload(true);
    }
};

socket.onclose = () => console.log("[Auto Refresh] Connection closed.");
socket.onerror = (error) => console.error(`[Auto Refresh] ${error.message}`);
//© Lauri Särkioja 2020