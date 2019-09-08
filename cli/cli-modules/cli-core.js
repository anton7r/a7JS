/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const chalk = require("chalk");
const clicore = {};
const log = console.log;

clicore.self = "a7js";


clicore.pathToA7JS = require.resolve("../../src/a7.js");


//Since the cli is inside the a7JS node cannot find the module a7js for some reason.
clicore.replaceSelf = function(Module){
    if(Module === clicore.self){
        return clicore.pathToA7JS;
    } else {
        return Module;
    }
};


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

clicore.importFrom = function(ImportStatement){
    return ImportStatement.match(/\".+\"/i)[0].replace(/\"/g, "");
};

clicore.importName = function(ImportStatement){
    return ImportStatement.replace(/import\s*/, "").replace(/\s*from\s*\".+?;*\"/, "");
};

clicore.importer = function(sourceCode){
    var wholeImports = sourceCode.match(/import\s+(\d|\w)+\s+from\s*\".+\";*/gi);
    var partialImports = sourceCode.match(/import\s*{\s*.*?\s*}\s+from\s*\".+?\";*/gi);
    //TODO:(Pro tip) make foreach into for loop because it is faster
    this.imports = 0;
    
    if (wholeImports !== null){
        this.imports += wholeImports.length;
        wholeImports.forEach(Import => {
            var importFrom = clicore.replaceSelf(clicore.importFrom(Import));
            var importName = clicore.importName(Import);
            var importableModule = require.resolve(importFrom);
            var moduleSourceCode = fs.readFileSync(importableModule, "utf-8").replace(/\s+/g, " ").replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "");

            var exportDefaultName = "";
            if(moduleSourceCode.match(/module.exports\s*=\s*(\w|\d)*;*/g) !== null){
                log("found a match", moduleSourceCode.match(/module\.exports\s*=\s*(\w|\d)*;*/g));
            }
            var importedModule = `/* `+ Import +` */(function(window){` + moduleSourceCode + ` if(typeof (window.` + importName + `) === "undefined"){window.` + importName + `=` + exportDefaultName + `}})(window)`;
            sourceCode = sourceCode.replace(Import, importedModule);
        });
    
    }

    if (partialImports !== null){
        this.imports += partialImports.length;
        partialImports.forEach(Import =>{
            var importFrom = clicore.importFrom(Import);
        });
    }

    //Development helpers
    log("whole imports:"+wholeImports);
    log("partial imports:"+partialImports);
    this.output = sourceCode;
    return this;
};


module.exports = clicore;