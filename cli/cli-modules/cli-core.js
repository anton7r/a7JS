const chalk = require("chalk");
const clicore = {};
const log = console.log;

clicore.pathToA7JS = require.resolve("../../dist/a7.js");

clicore.componentSource = function (string){
    return string.match(/\".+\"/g)[0].replace(/\"/g, "");
};

clicore.isRelativePath = function (url){
    if (url[0].charAt(0) === "."){
        return true;
    } else {
        return false;
    }
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