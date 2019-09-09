//Start a dev server
const chalk = require("chalk");
const http = require("http");
const log = console.log;
const fs = require("fs");
const clicore = require("./cli-core.js");

const requestLog = function(msg){
    log(chalk.default("Requesting file:"), msg);
};

const resolveFile = function(url){

    if(fs.existsSync("."+url) === true){
        var file = fs.readFileSync("."+url, "utf-8");
        var rawType = url.match(/\..+/g)[0];
        var type ="";

        if (rawType === ".js"){
            type = "application/javascript";
        } else if (rawType === ".css"){
            type = "text/css";
        }
        
        return {code: file, type: type};
    } else {
        return {code: fs.readFileSync("./index.html", "utf-8"), type: "text/html"};
    }
};

module.exports = function(prefport){
    var port;

    if(prefport === undefined){
        port = 2550;
    } else {
        port = prefport;
    } 

    clicore.infoLog("Development server is starting at port "+ port);

    var server = http.createServer(function (req, res){
        var file = resolveFile(req.url);
        res.writeHead(200, {'Content-Type': file.type});
        res.write(file.code);
        res.end();
    }).listen(port);
};