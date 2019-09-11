const fs = require("fs");
const log = console.log;
const pathToA7JS = require.resolve("../../src/a7.js");
const self = "a7js";
const uglifyJS = require("uglify-js");
const configPath = "./a7.config.json";
const clicore = require("./cli-core");

var config;

if(fs.existsSync(configPath)){
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} else {
    config = {entry:"noEntry"};
}


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
    parsedContainerStyles = parsedContainerStyles.replace(containerRx, ".a7-component-container." + componentTag);
    innerStyles = csssrc.replace(containerStylesRx, "");
    return {container:parsedContainerStyles,innerStyles:innerStyles};     
};

module.exports = function(sourceCode){
    var containerCSS = "";
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
            var componentSourceCode = fs.readFileSync(entryFolder + importableModule.replace(/(\.|\.\/)/, ""), "utf-8").replace(/\s+/g, " ");
            var componentSetup = componentSourceCode.match(/return\(.+\)/)[0];
            var htmlPath = componentSource(componentSetup.match(/template\s*:\s*\".+?\"/i)[0]);
            var CSSPath = componentSource(componentSetup.match(/styles\s*:\s*\".+?\"/i)[0]);

            var componentTag = componentSetup.match(/tag\s*:\s*\".+?\"/i)[0];
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

            //Add css compressor here!!!! instead of this compressing method
            css = css.replace(/\s+/g, " ");

            html = htmlCompressor(html);
            //replace literals
            templateLiterals = html.match(/{{\s*.+?\s*}}/);

            if(templateLiterals !== null){
                templateLiterals.forEach(function(literal){
                    var cleanLiteral = literal.replace(/({{|}})/g, "");
                    html = html.replace(literal, "\"+"+cleanLiteral+"+\"");
                });
            }

            cssObject = cssSplitter(css, componentTag);
            innerCSS = "<style>" + cssObject.innerStyles + "</style>";

            if (cssObject.container != ""){
                containerCSS += cssObject.container;
            }

            cssAndHtml = innerCSS + html;

            var componentOutput = componentSourceCode.replace(/export default function/, "function");
            componentOutput = componentOutput.replace(componentSetup, "return \""+ cssAndHtml +"\"");
            var executableComponent = "a7.registerComponent(\""+componentTag+"\"," + componentOutput + ");function "+importNameVar+"(a){return a7.createElement(\""+componentTag+"\",a)}";
            sourceCode = sourceCode.replace(Import, "/* "+Import+" */"+executableComponent);
        });
    }

    if (wholeImports !== null){
        this.imports += wholeImports.length;
        wholeImports.forEach(Import => {
            var importNameVar = importName(Import);
            var importableModule = require.resolve(replaceSelf(importFrom(Import)));
            var moduleSourceCode = fs.readFileSync(importableModule, "utf-8");

            var exportDefaultName = "";
            var moduleSourceCodeMatches = moduleSourceCode.match(moduleExportEquals);
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

    if(containerCSS != ""){
        sourceCode += "a7.loadCSS("+ containerCSS + ")";
    }
    //Development helpers
    //log("whole imports:"+wholeImports);
    //log("partial imports:"+partialImports);
    this.output = sourceCode;
    return this;
};