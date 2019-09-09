const fs = require("fs");
const log = console.log;
const pathToA7JS = require.resolve("../../src/a7.js");
const self = "a7js";
const uglifyJS = require("uglify-js");

//Since the cli is inside the a7JS node cannot find the module a7js for some reason.
const replaceSelf = function(Module){
    if(Module === self){
        return pathToA7JS;
    } else {
        return Module;
    }
};

const importFrom = function(ImportStatement){
    return ImportStatement.match(/(\"|\').+(\"|\')/i)[0].replace(/\"/g, "");
};

const importName = function(ImportStatement){
    return ImportStatement.replace(/import\s*/, "").replace(/\s*from\s*\".+?\";*/, "");
};

const eliminateComponents = function(val){
    if(val.match(/"\.\/components\/.+?\"/) !== null){
        return false;
    } else {
        return true;
    }
};

module.exports = function(sourceCode){
    var imports = [];
    var moduleExport = /module.exports\s*=\s*(\w|\d)*;*/g;

    var componentImports = sourceCode.match(/import\s+(\d|\w|\_)+\s+from\s*\"\.\/components\/.+?\";*/gi);
    var wholeImports = sourceCode.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);

    //Whole imports eliminate component imports
    wholeImports = wholeImports.filter(eliminateComponents);

    var partialImports = sourceCode.match(/import\s*{\s*.*?\s*}\s+from\s*\".+?\";*/gi);
    //TODO:(Pro tip) make foreach into for loop because it is faster
    this.imports = 0;
    
    if (componentImports !== null){
        this.imports += componentImports.length;
        componentImports.forEach(Import => {
            var importNameVar = importName(Import);
            var importableModule = importFrom(Import);

            log(importableModule);
            var componentSourceCode = fs.readFileSync("./app/" + importableModule.replace(/(\.|\.\/)/, ""), "utf-8");
        });
    }

    if (wholeImports !== null){
        this.imports += wholeImports.length;
        wholeImports.forEach(Import => {
            var importNameVar = importName(Import);
            var importableModule = require.resolve(replaceSelf(importFrom(Import)));
            var moduleSourceCode = fs.readFileSync(importableModule, "utf-8");

            var exportDefaultName = "";
            var moduleSourceCodeMatches = moduleSourceCode.match(moduleExport);
            if(moduleSourceCodeMatches !== null){
                moduleSourceCode = moduleSourceCode.replace(moduleSourceCodeMatches[0], "");
                exportDefaultName = moduleSourceCodeMatches[0].replace(/(module.exports\s*=\s*|;)/g, "");

            }
            var importedModule = `(function(window){` + moduleSourceCode + ` if(typeof (window.` + importNameVar + `) === "undefined"){window.` + importNameVar + `=` + exportDefaultName + `}})(window)`;
            var minifiedModule = uglifyJS.minify(importedModule);
            sourceCode = sourceCode.replace(Import, "/* " + Import + " */" + minifiedModule.code);
            imports += {from:importableModule,as:importNameVar};
        });
    
    }

    if (partialImports !== null){
        this.imports += partialImports.length;
        partialImports.forEach(Import =>{
            var importFromVar = importFrom(Import);
        });
        return clicore.errorLog("Importing only a part of a framework is not yet supported!");
    }
    //Development helpers
    //log("whole imports:"+wholeImports);
    //log("partial imports:"+partialImports);
    this.output = sourceCode;
    return this;
};