/* jshint -W104 */
const fs = require("fs");
const chalk = require("chalk");
const log = console.log;
const UglifyJS = require("uglify-js");
const clicore = require("./cli-core.js");
const importer = require("./cli-importer");

module.exports = function(settings) {
    var silent;

    //loads passed in settings
    if (settings !== undefined) {
        if (settings.silent === true){
            silent = true;
        }

    } else {
        silent = false;
    }

    var config = JSON.parse(fs.readFileSync("./a7.config.json", "utf-8"));

    if (config.entry === undefined){
        if(silent === false){
            clicore.errorLog("You have not defined the entrypoint of your app.");
        }
        return;
    } 
    else {
        if(silent === false){
            clicore.infoLog("config was successfully loaded.");
        }
    }

    var mainFile = fs.readFileSync(config.entry, "utf-8");
    fs.writeFileSync(config.output, importer(mainFile).output);
    return;

    var imports = mainFile.match(/import .+ from \".+\"/g);

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


            //FIXME: So many variable declarations, could be simplified
            var templateRawUrl = clicore.componentSource(document.match(/template(|\s+):(|\s+)\".+\"/i)[0]);
            var stylesRawUrl = clicore.componentSource(document.match(/styles(|\s+):(|\s+)\".+\"/i)[0]);
            var templateUrl;
            var stylesUrl;
            var componentTag = document.match(/tag(|\s+):(|\s+)\".+\"/i)[0].match(/\".+\"/)[0].replace(/\"/g, "");
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

            //TODO: at this point in cli-importer, move the rest also there
            var styles = fs.readFileSync(stylesUrl, "utf-8");

            //Add css compressor here!!!!
            styles = styles.replace(/\s+/g, " ");

            //container RegExp
            containerRx = new RegExp(componentTag, "g");
            containerStylesRx = new RegExp(componentTag + "(.|\s)+?\{(.|\s)+?\}", "g");
            var containerStyles = styles.match(containerStylesRx);
            var containerOutStyles = "";

            if (containerStyles !== null){
                containerStyles.forEach(function(style){
                    containerOutStyles += style;
                });
            }
            containerOutStyles = containerOutStyles.replace(containerRx, ".a7-component-container." + componentTag);
            var childrenStyles = styles.replace(containerStylesRx, "");
            
            var template = fs.readFileSync(templateUrl, "utf-8");
            var templateOut = "";
            //HTML minifier
            template.split("\r\n").forEach(function(line){
                templateOut += line.replace(/^\s+/g, "");
            });
            templateOut = templateOut.replace(/\s+/g, " ");

            templateLiterals = templateOut.match(/{{.+}}/g);

            if (templateLiterals !== null) {
                templateLiterals.forEach(function(literal){
                    newliteral = literal.replace(/{{/, "\"+props\.").replace(/}}/, "+\"");
                    templateOut = templateOut.replace(literal, newliteral);
                });
            } else {

            }

            var importerName = val.replace(/(import|from \".+\"| )/g, "");
            //Replaces component import with actual code that works

            var importComment = "";
            if(config.mode === "development"){
                importComment = "/*" + val + "*/";
            }

            mainFile = mainFile.replace(val, importComment + "a7.registerComponent(\"" + componentTag + "\", function(props){return \"<style>"+childrenStyles+"</style>"+templateOut+"\"}); function "+ importerName +"(props){return a7.createElement(\""+ componentTag + "\", {props:props})}");
        });
    } else {
        clicore.infoLog("no component imports detected.");
    }

    if(config.mode === "development"){
        fs.writeFileSync(config.output, mainFile);
        clicore.successLog("App was successfully buit. (in development mode)");

    } else if (config.mode === "production"){
        var minify = UglifyJS.minify(mainFile);
        if(minify.error){
            log(chalk.red("ERROR:"), minify.error.message, minify.error.line + ":" + minify.error.col);
        } else {
            clicore.successLog("App was successfully built.");
        }
    
        fs.writeFileSync(config.output, minify.code);
    } else {
        var additionalMessage;
        if(config.mode !== undefined){
            additionalMessage = "is not either \"development\" or \"production\"";
        } else {
            additionalMessage = "is undefined";
        }
        clicore.errorLog("could not build app since mode " + additionalMessage);
    }
};