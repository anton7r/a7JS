//Tapio
var err=false;
function showerror (errormsg, file){
    if(err) return;
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
    err=true;
}

addEventListener("error", (e) => {
    var f = e.filename.replace("http://", "")
   showerror(e.error, `${f}:${e.lineno}`) 
});
//Lauri
var ws = new WebSocket("ws://localhost:{{ port }}");
ws.onopen = () => console.log("[Auto Refresh] Connection established");

ws.onmessage = (e) => {
    var m=e.data;
    if(m.startsWith("error:")) {
        var er = JSON.parse(m.replace("error:",""));
        showerror(er.error, er.file)
    } else location.reload(true);
};

ws.onclose = () => console.log("[Auto Refresh] Connection closed.");
ws.onerror = (error) => console.error(`[Auto Refresh] ${error.message}`);
//© Lauri Särkioja 2020

console.error("IM TRIGGERED!!!!");