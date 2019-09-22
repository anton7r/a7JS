const fs = require("fs");
const log = console.log;
const pathToA7JS = require.resolve("../../src/a7.js");
const self = "a7js";
const uglifyJS = require("uglify-js");
const configPath = "./a7.config.json";
const clicore = require("./cli-core");
const cssMinifier = require("./cli-cssminifier");
const htmlCompiler = require("./cli-htmlcompiler");
const csso = require("csso");
var config;


if(fs.existsSync(configPath)){
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
    config = {entry:"noEntry"};
}

const minifier = function (source){
    var min = uglifyJS.minify(source);

    if (min.error){
        return clicore.errorLog(min.error);
    }
    //log(min.code)
    return min.code;
};

const existsRead = function(path){
    if(fs.existsSync(path)){
        return fs.readFileSync(path, "utf-8");
    } else {
        clicore.errorLog("File could not be located. "+ path);
        return process.exit(); 
    }
};

const isRelativePath = function (url){
    if (url[0].charAt(0) === "."){
        return true;
    } else {
        return false;
    }
};

const componentSource = function (string){
    return string.match(/\".+\"/g)[0].replace(/\"/g, "");
};

//Since the cli is inside the a7JS node cannot find the module a7js for some reason.
const replaceSelf = function(Module){
    if(Module === self){
        return pathToA7JS;
    } else {
        return Module;
    }
};

const getEntryFolder = function(){
    if(config.entry !== "noEntry"){
        return config.entry.replace(/(\w|\d)+\.js/i, "");
    }
};

const entryFolder = getEntryFolder();

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

const htmlCompressor = function(htmlsrc){
    htmlsrc = htmlsrc.replace(/\s+/g, " ");
    htmlsrc = htmlsrc.replace(/\r\n/g, "");
    htmlsrc = htmlsrc.replace(/\>\s/g, ">");
    htmlsrc = htmlsrc.replace(/\s\</g, "<");
    return htmlsrc;
};

//Searches properties from objects in sourceCode
function findProp (findFrom, find){
    var finder = new RegExp(find + "\s*:\s*\".+?\"", "i");
    return findFrom.match(finder)[0];
}

//splits css into non component container affecting to component container affecting ones
const cssSplitter = function(csssrc, componentTag){
    //container RegExp
    containerRx = new RegExp(componentTag, "g");
    containerStylesRx = new RegExp(componentTag + "(.|\s)+?\{(.|\s)+?\}", "g");
    var containerStyles = csssrc.match(containerStylesRx);
    var parsedContainerStyles = "";

    if (containerStyles !== null){
        containerStyles.forEach(function(style){
            parsedContainerStyles += style;
        });
    }
    parsedContainerStyles = parsedContainerStyles.replace(containerRx, ".a7-component." + componentTag);
    innerStyles = csssrc.replace(containerStylesRx, "");
    return {container:parsedContainerStyles,innerStyles:innerStyles};     
};

module.exports = function(sourceCode){
    sourceCode = "var a7importBridgeAPI = {};" + sourceCode;
    var CSSBundle = "";

    if(config.css.bundle === true && config.css.file !== undefined){
        var cssFile = config.css.file;

        if(fs.existsSync(cssFile) === true){
            var mainCSS = fs.readFileSync(cssFile, "utf-8");
            mainCSS = csso.minify(mainCSS, {
                filename:cssFile
            });

            CSSBundle += mainCSS;
            
        }
    }

    var imports = [];
    var moduleExportEquals = /module.exports\s*=\s*(\w|\d)*;*/g;

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

            var documentFolder = importableModule.replace(/(\w|\n)+\.js/g, "");
            var componentSourceCode = fs.readFileSync(entryFolder + importableModule.replace(/(\.|\.\/)/, ""), "utf-8");
            componentSourceCode = componentSourceCode.replace(/export default function\s*\(/, "function e(");
            componentSourceCode = componentSourceCode.replace(/export default function/, "function");
            
            var componentSetup = componentSourceCode.match(/return\s*\(\{(.|\s)*\}\)/)[0];
            var htmlPath = componentSource(findProp(componentSetup, "template"));
            var CSSPath = componentSource(findProp(componentSetup, "styles"));
            
            var componentTag = findProp(componentSetup, "tag");
            componentTag = componentTag.match(/\".+?\"/)[0].replace(/\"/g, "");

            documentFolder = entryFolder + documentFolder.replace(/\./, "");
            
            if(isRelativePath(htmlPath)){
                htmlPath = documentFolder + htmlPath.replace(/\.\//, "");
            }

            if(isRelativePath(CSSPath)){
                CSSPath = documentFolder + CSSPath.replace(/\.\//, "");
            }

            var css = existsRead(CSSPath);
            var html = existsRead(htmlPath);

            css = css.replace(/\s+/g, " ");

            html = htmlCompressor(html);
            html = html.replace(/\"/g, "\'");
            html = htmlCompiler(html);
            html = "a7.documentFragment(" + html + ")";
            //replace literals
            templateLiterals = html.match(/{{\s*.+?\s*}}/);

            if(templateLiterals !== null){
                templateLiterals.forEach(function(literal){
                    var cleanLiteral = literal.replace(/({{|}})/g, "");
                    html = html.replace(literal, "\'+"+cleanLiteral+"+\'");
                });
            }

            cssObject = cssSplitter(css, componentTag);
            innerCSS = cssObject.innerStyles;

            cssRules = innerCSS.match(/.+?\s*?\{.+?\}/);

            if(cssRules !== null){
                cssRules.forEach(function (rule){
                    CSSBundle += ".a7-component." + componentTag+ " " + rule;
                });
            }

            if (cssObject.container != ""){
                CSSBundle += cssObject.container;
            }

            var componentOutput = componentSourceCode.replace(componentSetup, "return " + html);
            componentOutput = componentOutput.replace(/((\'\')\s*\+\s*|(\s*\+\s*\'\'))/g, "");
            componentOutput = minifier(componentOutput);
            var executableComponent = "/* " + importNameVar + " */a7.registerComponent(\""+componentTag+"\"," + componentOutput + ");function "+importNameVar+"(a){return a7.createElement(\""+componentTag+"\",a)}";
            sourceCode = sourceCode.replace(Import, executableComponent);
            imports += {from:importableModule,as:importNameVar};
        });
    }

    if (wholeImports !== null){
        this.imports += wholeImports.length;
        wholeImports.forEach(Import => {
            var importNameVar = importName(Import);
            var importableModule = require.resolve(replaceSelf(importFrom(Import)));
            var moduleSourceCode = fs.readFileSync(importableModule, "utf-8");
            var modulesImports = moduleSourceCode.match(/(import\s+.+?\s+from\".*?\"|require\(.*?\))/g);

            if(modulesImports !== null){
                clicore.errorLog("Module " + importNameVar +" has its own imports which we cannot right now import with our detections!");
            }

            if(config.mode === "production"){
                moduleSourceCode = minifier(moduleSourceCode);
            }

            var exportDefaultName = "";
            var moduleSourceCodeMatches = moduleSourceCode.match(moduleExportEquals);
            if(moduleSourceCodeMatches !== null){
                moduleSourceCode = moduleSourceCode.replace(moduleSourceCodeMatches[0], "");
                exportDefaultName = moduleSourceCodeMatches[0].replace(/(module.exports\s*=\s*|;)/g, "");

            }
            var importedModule = `;(function(){` + moduleSourceCode + ` a7importBridgeAPI.` + importNameVar + `=` + exportDefaultName + `;})();var ` + importNameVar + `=a7importBridgeAPI.` + importNameVar + ";";
            var minifiedModule;
            
            if(config.mode === "production"){
                minifiedModule = minifier(importedModule);
            } else {
                minifiedModule = importedModule;
            }

            sourceCode = sourceCode.replace(Import, "/* " + importNameVar + " */" + minifiedModule);
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

    CSSBundle = cssMinifier(CSSBundle);

    if(CSSBundle != ""){
        sourceCode += "a7.loadCSS(\""+ CSSBundle + "\")";
    }


    if (config.mode === "production"){
        sourceCode = "(function(){" + sourceCode + "})()";
        sourceCode = uglifyJS.minify(sourceCode, {
            compress:{
                passes:1
            },
            mangle:{
                toplevel:true
            }
        }).code;
    }

    clicore.successLog("app was built.");

    //Development helpers
    //log("whole imports:"+wholeImports);
    //log("partial imports:"+partialImports);
    return sourceCode;
};