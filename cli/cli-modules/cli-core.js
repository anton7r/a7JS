/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const chalk = require("chalk");
const clicore = {};
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

clicore.pathToA7JS = require.resolve("../../src/a7.js");

clicore.componentSource = function (string){
    return string.match(/\".+\"/g)[0].replace(/\"/g, "");
};

clicore.htmlTags = require("./cli-tags.js");

//finds the a7 import
clicore.importA7rx = /import (a7|{.+?}) from \"a7JS\"(;|)/i;

clicore.isRelativePath = function (url){
    if (url[0].charAt(0) === "."){
        return true;
    } else {
        return false;
    }
};

clicore.config = config;

clicore.getImports = function(){
    var source = fs.readFileSync(config.entry, "utf-8");
    var imports = source.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);
    return {imports:imports,source:source};
};

clicore.getEntryFolder = function(){
    if(config.entry !== undefined){
        return config.entry.replace(/[^\/]+\.js/, "");
    } else {
        return;
    }
};

clicore.getVersion = function(){
    var a7pack = JSON.parse(fs.readFileSync(require.resolve("../../package.json"), "utf-8"));
    return a7pack.version;
};

clicore.atFileLog = function (file){
    log(chalk.red("At file:"), file);
};

//TODO:
clicore.successLog = function (msg){
    log(chalk.green("SUCCESS:"), msg);
};

clicore.errorLog = function (msg){
    log(chalk.red("ERROR:"), msg) ;
};

clicore.infoLog = function (msg){
    log(chalk.cyan("INFO:"), msg);
};

clicore.fileCreatedLog = function (fileName, fileByteSize){
    log(chalk.cyan("INFO:"), " file", fileName, "was created.");
};

clicore.helperLog = function (argument, text){
    log(chalk.cyan(argument), "-", text);
};

clicore.syntaxLog = function(syntax){
    log(chalk.gray(" - Syntax: " + syntax));
};

module.exports = clicore;