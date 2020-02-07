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
const errorHandler = require("../core/errorhandler");

module.exports = function(port, dir){
    if(core.configLoaded === false){
        core.errorLog("Couldn't find configuration file in the directory.")
        return;
    }

    core.config.mode = "development";
    var conf = core.config;
    var packaged = "";

    //returns the index file
    function getIndexHTML(){
        var index = fs.readFileSync(dir + "index.html", "utf-8");
        var script = fs.readFileSync(require.resolve("./client.js"), "utf-8");
        script = script.replace("{{ port }}", port);
        var css = fs.readFileSync(require.resolve("./client.css"), "utf-8");
        css = css.replace(/[\r\n]/g, "").replace(/\s+/g, " ");
        script = script.replace("{{ css }}", css);
        return index.replace("</body>", `<!-- a7js dev script ---><script>${script}</script></body>`);
    }

    function resolveFile(url){
        if("." + url === conf.output){
            return packaged;
        } else if(url === "/"){
            if (fsx.fileExists(dir + "index.html")) {
                return getIndexHTML();
            } else {
                return "Could not find index.html file from directory";
            }
    
        } else if (fsx.fileExists(dir+url) === true){
            return fs.readFileSync(dir+url);
        } else {
            return getIndexHTML();
        }
    }
    
    if(dir === undefined) dir = "./";
    if(port === undefined) port = 2550;

    var server = http.createServer((req, res) => {
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
    var w = new WebSocket.Server({ server });
    w.on("connection", (c) => {
        c.send(`error:${JSON.stringify(errorHandler.errors[0])}`)
    })

    //sends messages to all websocket connections
    var sendAll=(m)=>w.clients.forEach((client)=>client.send(m));

    //Builds the app
    function pack(){
        errorHandler.clear();
        console.clear();
        var newPackaged = build(fs.readFileSync(conf.entry, "utf-8"));
        try {
            newPackaged = build(fs.readFileSync(conf.entry, "utf-8"));
        } catch(e){

        }
        console.log(`${chalk.green("SUCCESS")} app was built at ${chalk.gray(new Date())}

  Your app is running at ${chalk.blue(`localhost:${port}/`)}
  
  To exit A7JS Development server press ${chalk.black.bgBlue("CTRL")} and ${chalk.black.bgBlue("C")}`);

        if(packaged !== newPackaged && newPackaged !== ""){
            packaged = newPackaged;
            sendAll("r");
        }
    }
    pack();

    //Lauri
    fs.watch(dir, { encoding: "utf-8", recursive:true }, (event, filename) => {
        if(event !== "change"){
            return
        }
        pack();
    }); //© Lauri Särkioja 2020

    server.listen(port);
};