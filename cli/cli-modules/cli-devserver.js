/* jshint -W104 */
/* jshint -W119 */

//Start a dev server
const http = require("http");
const log = console.log;
const fs = require("fs");
const core = require("./cli-core.js");
const zlib = require("zlib");
const build = require("./cli-importer");

var buildMode;
if(core.config.devserver !== undefined){
    if(core.config.devserver.buildmode !== undefined){
        buildMode = core.config.devserver.buildmode;
    } else {
        buildMode = "manual";
    }
}  else {
    buildMode = "manual";
}

const isFile = function(path){
    if(fs.existsSync(path) === false){
        return false;
    }

    var stats = fs.statSync(path);

    if(stats){
        if(stats.isFile() === true){
            return true;
        } else {
            return false;
        }

    } else{
        return false;
    }
};

const resolveFile = function(url){
    if(isFile("./"+url)){
        if(url.charAt(0) === "/"){
            url.replace("/", "");
        }
    }
    if(url === conf.output){
        return packaged;
    } else if(url === "/"){
        if (isFile("./index.html")) {
            return fs.readFileSync("./index.html", "utf-8");
        } else {
            return "Could not find index.html file from directory";
        }

    } else if (isFile("./"+url) === true){
        return fs.readFileSync("./"+url);
    } else {
        return fs.readFileSync("./index.html", "utf-8");
    }
};

module.exports = function(prefport){
    var conf = core.config;
    var packaged;
    function pack(){
        packaged = build(fs.readFileSync(conf.entry, "utf-8"));
        core.infoLog("App was built");
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
    
    //set host port number
    var port;

    if(prefport === undefined){
        port = 2550;
    } else {
        port = prefport;
    } 

    core.infoLog("Development server is starting at port "+ port);
    core.infoLog("in order to stop the server type \"stop\".");

    if(buildMode === "manual"){
        core.infoLog("in order to build your code type \"build\".");
    } else if (buildMode === "auto") {
        core.infoLog("buildmode auto is enabled");
    } else {
        core.errorLog("no config.devserver.buildmode specified.");
        core.atFileLog("a7.config.json");
        process.exit();
    }

    var server = http.createServer(function (req, res){
        var types = req.headers.accept;//.split(",")
        var type;
        if (types.indexOf("," > 0)){
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
        if(type !== "png/image"){
            res.writeHead(200, {'Content-Type': type, 'Content-Encoding': "gzip"});
            zlib.gzip(new Buffer.alloc(file.length, file, "utf-8"), function(_, result){
                res.end(result);
            });
        } else {
            res.writeHead(200, {'Content-Type': type});
            res.end(file);
        }
    }).listen(port);
};