/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const chalk = require("chalk");
const log = console.log;

//config Loading settings
var config = {
    fileLoc: "./a7.config.json",
    custom: {},
    default: JSON.parse(fs.readFileSync(require.resolve("../defaults/config.json"), "utf-8"))
};
if(fs.existsSync(config.fileLoc) === true){
    config.custom = JSON.parse(
        fs.readFileSync(config.fileLoc, "utf-8")
    );
}

var debug;
if (config.custom.debugger === true){
    console.log(chalk.cyan("A7JS Debugger mode"), "is enabled");
    debug = true;
}

module.exports = {
    config: {
        ...config.default,
        ...config.custom
    },

    importA7rx: /import (a7|{.+?}) from \"a7JS\"(;|)/i,
    pathToA7JS: require.resolve("../../src/a7.js"),
    htmlTags: fs.readFileSync(require.resolve("../htmltags.txt"), "utf-8").replace(/\r/g, "").split("\n"),
    componentSource(string){
        return string.match(/\".+\"/g)[0].replace(/\"/g, "");
    },

    isRelativePath(url){
        if (url[0].charAt(0) === "."){
            return true;
        } else {
            return false;
        }
    },

    getImports(){
        var source = fs.readFileSync(this.config.entry, "utf-8");
        var imports = source.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);
        return {imports:imports,source:source};
    },

    getEntryFolder(){
        return core.config.entry.replace(/[^\/]+\.js/, "");
    },

    getVersion(){
        var a7pack = JSON.parse(fs.readFileSync(require.resolve("../../package.json"), "utf-8"));
        return a7pack.version;
    },
    debug(msg){
        if(debug === true){
            console.log(chalk.yellow("DEBUG"),msg);
        }
    },
    atFileLog(file){
        log(chalk.red("AT FILE:"), file);
    },

    successLog(msg){
        log(chalk.green("SUCCESS"), msg);
    },

    errorLog(msg){
        log(chalk.red("ERROR"), msg) ;
    },

    infoLog(msg){
        log(chalk.cyan("INFO"), msg);
    },

    fileCreatedLog(fileName){
        log(chalk.cyan("INFO"), " file", fileName, "was created.");
    },

    helperLog(argument, text){
        log(chalk.cyan(argument), "-", text);
    },

    syntaxLog(syntax){
        log(chalk.gray(" - Syntax: " + syntax));
    }
};