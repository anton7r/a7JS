/* jshint -W104 */
/* jshint -W119 */
const http = require("http");
const fs = require("fs");
const core = require("../core/core");
const zlib = require("zlib");
const build = require("../compiler/compiler");
const chalk = require("chalk");
const fsx = require("../core/fsx");
const websocket = require("ws");

module.exports = function(port, dir){

    if(core.configLoaded === false){
        core.errorLog("Couldn't find configuration file in the directory.")
        return;
    }

    core.config.mode = "development";
    var conf = core.config;
    var rootDir;
    var packaged = "";

    var webSocketPort = 63005;

    function getIndexHTML(){
        var index = fs.readFileSync(rootDir + "index.html", "utf-8");
        var script = fs.readFileSync(require.resolve("./client.js"), "utf-8");
        script = script.replace("{{ port }}", port);
        index = index.replace("</body>", `<!-- a7js inserted script file ---><script>${script}</script></body>`);
        return index;
    }

    function resolveFile(url){
        //core.debug(fs.statSync(rootDir+url).isFile());
        if("."+url === conf.output){
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

    function pack(){
        console.clear();
        packaged = build(fs.readFileSync(conf.entry, "utf-8"));
        var time = new Date();
        console.log(chalk.green("SUCCESS"), "app was built at", chalk.gray(time),
`

  Your app is running at ` + chalk.blue("localhost:"+port+"/") + `
  
  To exit A7JS Development server press `+ chalk.black.bgBlue("CTRL") +` and `+ chalk.black.bgBlue("C") +`
`
        );
    }

    if(port === undefined){
        port = 2550;
    }
    pack();
    setInterval(pack, 1000);

    var ws = new WebSocket.Server({
        port: webSocketPort,
        perMessageDeflate: {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            }
          }
    })

    

    http.createServer(function (req, res){
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

    }).listen(port);
};