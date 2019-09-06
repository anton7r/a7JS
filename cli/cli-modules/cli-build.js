const fs = require("fs");
const chalk = require("chalk");
const log = console.log;
const UglifyJS = require("uglify-js");
const clicore = require("./cli-core.js");

module.exports = function() {
    var config = JSON.parse(fs.readFileSync("./a7.config.json", "utf-8"));

    if(config.entry === undefined){
        log("You have not defined the entrypoint of your app.");
        return;
    } 
    else {
        log(chalk.cyan("LOADED:"), "config");
    }

    var mainFile = fs.readFileSync(config.entry, "utf-8");

    mainFile = mainFile.replace(/import a7 from \"@a7JS\"(;|)/i, fs.readFileSync(clicore.pathToA7JS, "utf-8"));
    var imports = mainFile.match(/import .+ from \".+\"/g);
    console.log(imports);

    if (imports !== null){
        imports.forEach(function(val){
            var pathToComponent = val.match(/".+"/),
            document;
            var documentPath;

            pathToComponent[0] = pathToComponent[0].replace(/\"/g, "");
            if(clicore.isRelativePath(pathToComponent[0])){
                documentPath = "./app" + pathToComponent[0].replace(/\./, "");
                document = fs.readFileSync(documentPath, "utf-8");
            } else {
                documentPath = pathToComponent[0];
                document = fs.readFileSync(documentPath, "utf-8");
            }
            var documentFolder = documentPath.replace(/(\w|\n)+\.js/g, "");

            var templateRawUrl = clicore.componentSource(document.match(/template(|\s+):(|\s+)\".+\"/i)[0]);
            var stylesRawUrl = clicore.componentSource(document.match(/styles(|\s+):(|\s+)\".+\"/i)[0]);
            var templateUrl;
            var stylesUrl;

            if(clicore.isRelativePath(templateRawUrl)){
                templateUrl = documentFolder + templateRawUrl.replace(/\.\//, "");
            } else {
                templateUrl = templateRawUrl;
            }

            if(clicore.isRelativePath(stylesRawUrl)){
                stylesUrl = documentFolder + stylesRawUrl.replace(/\.\//, "");
            } else {
                stylesUrl = stylesRawUrl;
            }

            var styles = fs.readFileSync(stylesUrl, "utf-8");
            var template = fs.readFileSync(templateUrl, "utf-8");

            console.log(styles, template);
        });
    } else {
        infoLog("no component imports detected.");
    }

    var minify = UglifyJS.minify(mainFile);
    if(minify.error){
        log(chalk.red("ERROR:"), minify.error.message, minify.error.line + ":" + minify.error.line);
    }

    fs.writeFileSync(config.output, minify.code);
};