/* jshint -W104 */
/* jshint -W119 */

//Start a dev server
const chalk = require("chalk");
const http = require("http");
const log = console.log;
const fs = require("fs");
const clicore = require("./cli-core.js");
const zlib = require("zlib");
const build = require("./cli-build");
const os = require("os").type();

var buildMode;

if(clicore.config.devserver.buildmode !== undefined){
    buildMode = clicore.config.devserver.buildmode;
} else {
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


const openInDefaultBrowser = function(url){
    if(os === "Windows_NT"){
        //The os is windows
        require('child_process').spawn('explorer', ["http://"+url]);
    } else {
        infoLog("We dont have support yet for the OS youre using. Open a new issue, so we can add support!");
    }
};

const uinput = process.stdin;
uinput.setEncoding("utf-8");

const resolveFile = function(url){
    var type ="";

    if(isFile("./"+url)){

        if(url.charAt(0) === "/"){
            url.replace("/", "");
        }
        var rawType = url.match(/\..+/g)[0];
    
        if (rawType === ".js"){
        
            type = "application/javascript";
        
        } else if (rawType === ".png"){
        
            type = "image/png";
        
        } else if (rawType === ".css"){
        
            type = "text/css";
        } else {
        
            type = "text/plain";
        }
    
    }

    if(url === "/"){
        if (isFile("./index.html")) {
            return {code: fs.readFileSync("./index.html", "utf-8"), type: "text/html"};
        } else {
            return {code: "Could not find index.html file from directory", type:"text/html"};
        }

    } else if (isFile("./"+url) === true){
        return {code: fs.readFileSync("./"+url), type: type};
    } else {
        return {code: fs.readFileSync("./index.html", "utf-8"), type: "text/html"};
    }
};

module.exports = function(prefport){
    //set host port number
    var port;

    if(prefport === undefined){
        port = 2550;
    } else {
        port = prefport;
    } 

    clicore.infoLog("Development server is starting at port "+ port);
    clicore.infoLog("in order to stop the server type \"stop\".");

    if(buildMode === "manual"){
        clicore.infoLog("in order to build your code type \"build\".");
    } else if (buildMode === "auto") {
        clicore.infoLog("buildmode auto is enabled");
    } else {
        clicore.errorLog("no config.devserver.buildmode specified.");
        clicore.atFileLog("a7.config.json");
        process.exit();
    }

    uinput.on("data", data => {
        if(data === "stop\r\n"){
            clicore.infoLog("Development server stopped.");
            process.exit();
        } else if (data === "build\r\n") {
            clicore.infoLog("App was built");
            build({silent:true});
        } else {
            clicore.infoLog("cant understand " + data);
        }
    });

    var server = http.createServer(function (req, res){

        var file = resolveFile(req.url);

        if(file.type !== "png/image"){

            res.writeHead(200, {'Content-Type': file.type, 'Content-Encoding': "gzip"});
            var fileBuffer = new Buffer(file.code, "utf-8");
            zlib.gzip(fileBuffer, function(_, result){
                res.end(result);
            });

        } else {

            res.writeHead(200, {'Content-Type': file.type});
            res.end(file.code);
            
        }

    }).listen(port);

    openInDefaultBrowser("localhost:" + port);
};