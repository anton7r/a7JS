/* jshint -W104 */
/* jshint -W119 */
const http = require("http");
const fs = require("fs");
const core = require("../core/core");
const zlib = require("zlib");
const build = require("../compiler/compiler");
const chalk = require("chalk");
const fsx = require("../core/fsx");
const WebSocket = require("ws");

module.exports = function(port, dir){

    if(core.configLoaded === false){
        core.errorLog("Couldn't find configuration file in the directory.")
        return;
    }

    core.config.mode = "development";
    var conf = core.config;
    var rootDir;
    var packaged = "";

    //returns the index file
    function getIndexHTML(){
        var index = fs.readFileSync(rootDir + "index.html", "utf-8");
        var script = fs.readFileSync(require.resolve("./client.js"), "utf-8");
        script = script.replace("{{ port }}", port);
        return index.replace("</body>", `<!-- a7js dev script ---><script>${script}</script></body>`);
    }

    function resolveFile(url){
        if("." + url === conf.output){
            return packaged;
        } else if(url === "/"){
            if (fsx.fileExists(rootDir + "index.html")) {
                return getIndexHTML();
            } else {
                return "Could not find index.html file from directory";
            }
    
        } else if (fsx.fileExists(rootDir+url) === true){
            return fs.readFileSync(rootDir+url);
        } else {
            return getIndexHTML();
        }
    }
    
    if(dir !== undefined){
        rootDir = dir;
    } else {
        rootDir = "./";
    }

    //Builds the app
    function pack(){
        console.clear();
        packaged = build(fs.readFileSync(conf.entry, "utf-8"));
        console.log(chalk.green("SUCCESS"), "app was built at", chalk.gray(new Date()),
`

  Your app is running at ` + chalk.blue("localhost:"+port+"/") + `
  
  To exit A7JS Development server press `+ chalk.black.bgBlue("CTRL") +` and `+ chalk.black.bgBlue("C")
        );
    }

    if(port === undefined){
        port = 2550;
    }
    pack();


    var server = http.createServer(function (req, res){
        var types = req.headers.accept;//.split(",")
        var type;

        if (types === "" || types === undefined){
            type = "";
        } else if (types.indexOf("," > 0)){
            var t = types.split(",");
            
            for(var i = 0; i<t.length; i++){
                if(t[i] !== "*/*"){
                    type = t[i];
                    break;
                } else if (t[i] === "*/*"){
                    type = "application/javascript";
                    break;
                }
            }
        }

        var file = resolveFile(req.url);

        if(type !== "png/image" || type !== "") {
            res.writeHead(200, {'Content-Type': type, 'Content-Encoding': "gzip"});
            zlib.gzip(new Buffer.from(file, "utf-8"), function(_, result){
                res.end(result);
            });
        } else {
            res.writeHead(200, {'Content-Type': type});
            res.end(file);
        }

    });
    
    var listeners = [];

    //sends messages to all websocket connections
    function sendAll(message){
        for(var i; i < listeners.length; i++){
            listeners[i].ws.send(message);
        }
    }

    //initializes the websocket
    var w = new WebSocket.Server({ server });
    w.on("connection", function(ws){
        id = listeners.length;
        console.log("new connection");
        function correct(){
            id--;
        }

        //adds new listener to the list
        listeners.push({ws, correct});

        //removes it self from the list
        ws.on("close", function(){
            console.log(listeners);
            listeners.splice(id, 1);
            for(var i = id; i < listeners.length; i++){
                listeners[i].correct();
            }
        });
    });

    //send refresh message to the client
    function clientUpdate(){
        sendAll("R");
    }

    //send the error message to the client
    function clientError(obj){
        sendAll("error:" + JSON.stringify(obj));
    }

    //Lauri
    fs.watch(rootDir, { encoding: "utf-8", recursive:true }, function (event, filename) {
        if(event !== "change"){
            return
        }
        console.log("Changed");
        pack();
        clientUpdate();
    }); //© Lauri Särkioja 2020

    server.listen(port);
};