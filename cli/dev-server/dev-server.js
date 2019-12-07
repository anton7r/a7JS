/* jshint -W104 */
/* jshint -W119 */
const http = require("http");
const fs = require("fs");
const core = require("../core/core.js");
const zlib = require("zlib");
const build = require("../compiler/compiler");
module.exports = function(port, dir){
    var conf = core.config;
    var rootDir;
    var buildMode = conf.devserver.buildmode;
    var packaged = "";
    function resolveFile(url){
        //CHECK:FIXME: abstraction needed
        if(fs.existsSync(rootDir+url)){
            if(url.charAt(0) === "/"){
                url.replace("/", "");
            }
        }
        // UP
    
        if("."+url === conf.output){
            return packaged;
        } else if(url === "/"){
            if (fs.existsSync(rootDir + "index.html")) {
                return fs.readFileSync(rootDir + "index.html", "utf-8");
            } else {
                return "Could not find index.html file from directory";
            }
    
        } else if (fs.existsSync(rootDir+url) === true){
            return fs.readFileSync(rootDir+url);
        } else {
            return fs.readFileSync(rootDir + "index.html", "utf-8");
        }
    }
    
    if(dir !== undefined){
        rootDir = dir;
    } else {
        rootDir = "./";
    }

    function pack(){
        packaged = build(fs.readFileSync(conf.entry, "utf-8"));
    }

    pack();
    const uinput = process.stdin;
    uinput.setEncoding("utf-8");
    uinput.on("data", data => {
        if(data === "stop\r\n"){
            core.infoLog("Saving built file.");
            fs.writeFileSync(conf.output, packaged);
            core.infoLog("Development server stopped.");
            process.exit();
        } else if (data === "build\r\n") {
            pack();
        } else {
            core.infoLog("cant understand " + data);
        }
    });

    if(port === undefined){
        port = 2550;
    }
    
    core.infoLog("Development server is starting at localhost:"+ port);
    core.infoLog("in order to stop the server type \"stop\".");

    if(buildMode === "manual"){
        core.infoLog("in order to build your code type \"build\".");
    } else if (buildMode === "auto") {
        core.infoLog("buildmode auto is enabled");
        setInterval(pack, 1000);
    } else {
        core.errorLog("no config.devserver.buildmode specified.");
        core.atFileLog("a7.config.json");
        process.exit();
    }

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