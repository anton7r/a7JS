//Start a dev server
const chalk = require("chalk");
const http = require("http");
const log = console.log;
const fs = require("fs");
const clicore = require("./cli-core.js");
const uinput = process.stdin;

const configPath = "./a7.config.json";
var config;

if(fs.existsSync(configPath)){
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
    config = {entry:"./app/index.js", output:"./appbuild.js"};
}

const build = require("./cli-build");

const os = require("os").type();

const openInDefaultBrowser = function(url){
    if(os === "Windows_NT"){
        //The os is windows
        require('child_process').spawn('explorer', ["http://"+url]);
    } else {
        infoLog("We dont have support yet for the OS youre using. Open a new issue, so we can add support!");
    }
};
var buildN = 0;
uinput.setEncoding("utf-8");

const resolveFile = function(url){

    if(url.charAt(0) === "/"){
        url.replace("/", "");
    }

    if(url === "/"){

        return {code: fs.readFileSync("./index.html", "utf-8"), type: "text/html"};

    } else if (fs.existsSync("./"+url) === true){

        var file = fs.readFileSync("./"+url, "utf-8");
        var rawType = url.match(/\..+/g)[0];
        var type ="";

        if (rawType === ".js"){
            type = "application/javascript";
        } else if (rawType === ".css"){
            type = "text/css";
        } else {
            type = "text/plain";
        }
        
        return {code: file, type: type};
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
    
    log("Build", buildN);
    buildN++;

    uinput.on("data", data => {
        if(data === "stop\r\n"){
            clicore.infoLog("Development server stopped.");
            process.exit();
        } else {
            clicore.infoLog("cant understand " + data);
        }
    });

    var server = http.createServer(function (req, res){
        var file = resolveFile(req.url);
        res.writeHead(200, {'Content-Type': file.type});
        res.write(file.code);
        res.end();
    }).listen(port);
    
    var changes = 0;

    setInterval(function(){
        console.clear();
        build({silent:true});
        log("Build", buildN);
        buildN++;
    }, 10000);

    openInDefaultBrowser("localhost:" + port);
};