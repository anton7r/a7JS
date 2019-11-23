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
module.exports = {
    
    config: {
        ...config.default,
        ...config.custom
    },

    importA7rx: /import (a7|{.+?}) from \"a7JS\"(;|)/i,
    pathToA7JS: require.resolve("../../src/a7.js"),
    htmlTags: require("./cli-tags.js"),
    componentSource: function (string){
        return string.match(/\".+\"/g)[0].replace(/\"/g, "");
    },

    isRelativePath: function (url){
        if (url[0].charAt(0) === "."){
            return true;
        } else {
            return false;
        }
    },

    getImports: function(){
        var source = fs.readFileSync(config.entry, "utf-8");
        var imports = source.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);
        return {imports:imports,source:source};
    },

    getEntryFolder: function(){
        return core.config.entry.replace(/[^\/]+\.js/, "");
    },

    getVersion: function(){
        var a7pack = JSON.parse(fs.readFileSync(require.resolve("../../package.json"), "utf-8"));
        return a7pack.version;
    },

    atFileLog: function (file){
        log(chalk.red("At file:"), file);
    },

    successLog: function (msg){
        log(chalk.green("SUCCESS:"), msg);
    },

    errorLog: function (msg){
        log(chalk.red("ERROR:"), msg) ;
    },

    infoLog: function (msg){
        log(chalk.cyan("INFO:"), msg);
    },

    fileCreatedLog: function (fileName){
        log(chalk.cyan("INFO:"), " file", fileName, "was created.");
    },

    helperLog: function (argument, text){
        log(chalk.cyan(argument), "-", text);
    },

    syntaxLog: function(syntax){
        log(chalk.gray(" - Syntax: " + syntax));
    }
};