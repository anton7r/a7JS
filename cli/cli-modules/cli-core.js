/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const chalk = require("chalk");
const core = {};
const log = console.log;

const confFile = "./a7.config.json";
let config;

if(fs.existsSync(confFile) === true){
    
    config = JSON.parse(
        fs.readFileSync(confFile, "utf-8")
    );

} else {
    config = {entry:"./app/index.js", output:"./appbuild.js"};
}

core.pathToA7JS = require.resolve("../../src/a7.js");

core.componentSource = function (string){
    return string.match(/\".+\"/g)[0].replace(/\"/g, "");
};

core.htmlTags = require("./cli-tags.js");

//finds the a7 import
core.importA7rx = /import (a7|{.+?}) from \"a7JS\"(;|)/i;

core.isRelativePath = function (url){
    if (url[0].charAt(0) === "."){
        return true;
    } else {
        return false;
    }
};

core.config = config;

core.getImports = function(){
    var source = fs.readFileSync(config.entry, "utf-8");
    var imports = source.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);
    return {imports:imports,source:source};
};

core.getEntryFolder = function(){
    if(config.entry !== undefined){
        return config.entry.replace(/[^\/]+\.js/, "");
    } else {
        return;
    }
};

core.getVersion = function(){
    var a7pack = JSON.parse(fs.readFileSync(require.resolve("../../package.json"), "utf-8"));
    return a7pack.version;
};

core.atFileLog = function (file){
    log(chalk.red("At file:"), file);
};

//TODO:
core.successLog = function (msg){
    log(chalk.green("SUCCESS:"), msg);
};

core.errorLog = function (msg){
    log(chalk.red("ERROR:"), msg) ;
};

core.infoLog = function (msg){
    log(chalk.cyan("INFO:"), msg);
};

core.fileCreatedLog = function (fileName, fileByteSize){
    log(chalk.cyan("INFO:"), " file", fileName, "was created.");
};

core.helperLog = function (argument, text){
    log(chalk.cyan(argument), "-", text);
};

core.syntaxLog = function(syntax){
    log(chalk.gray(" - Syntax: " + syntax));
};

module.exports = core;