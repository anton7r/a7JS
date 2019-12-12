/* jshint -W104 */
/* jshint -W119 */
const http = require("http");
const fs = require("fs");
const core = require("../core/core.js");
const zlib = require("zlib");
const build = require("../compiler/compiler");
const chalk = require("chalk");
module.exports = function(port, dir){
    core.config.mode = "development";
    var conf = core.config;
    var rootDir;
    var packaged = "";
    function resolveFile(url){
        //CHECK:FIXME: abstraction needed
        //core.debug(fs.statSync(rootDir+url).isFile());
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
    setInterval(pack, 10000);

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