/* jshint -W104 */
/* jshint -W119 */
/* jshint -W049 */
const fs = require("fs");
const log = console.log;
const uglifyJS = require("uglify-js");
const core = require("./cli-core");
const cssMinifier = require("./cli-cssminifier");
const htmlCompiler = require("./cli-htmlcompiler");
const csso = require("csso");
var config = core.config;

const minifier = function (source){
    var min; 
    try {
        min = uglifyJS.minify(source);
        return min.code;
    } catch (e){
        core.errorLog("an error happened while trying to minify a script");
        return source;
    }
};

const existsRead = function (path){
    if(fs.existsSync(path)){
        return fs.readFileSync(path, "utf-8");
    } else {
        core.errorLog("file could not be located. "+ path);
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

const getEntryFolder = function(){
    if(config.entry !== "noEntry"){
        return config.entry.replace(/(\w|\d)+\.js/i, "");
    }
};

const entryFolder = getEntryFolder();

//purePath is our innovative technology to "relational pairing" from file paths to make them work on any given file system.
//for example if you have ../ or ./ in the path purePath will happily remove it.
const purePath = (path) => {
    return path.replace(/(\/\.\/|\/.*\/\.\.\/)/g, "/")
}

const importHandler = function(imp){
    return {
        path: imp.match(/(\"|\').+(\"|\')/i)[0].replace(/\"/g, ""),
        name: imp.replace(/import\s*/, "").replace(/\s*from\s*\".+?\";*/, ""),
        sourceCode: "no value"
    }
};

const eliminateComponents = function(val){
    if(val.match(/"\.\/components\/.+?\"/) !== null){
        return false;
    } else {
        return true;
    }
};
//Searches properties from objects in sourceCode
function findProp (findFrom, find){
    return findFrom.match(new RegExp(find + "\s*:\s*\".+?\"", "i"))[0];
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
    return {container:parsedContainerStyles,innerStyles:csssrc.replace(containerStylesRx, "")};     
};

module.exports = function(sourceCode){
    sourceCode = "var a7importBridgeAPI = {};" + sourceCode;
    var CSSBundle = "";
    
    if(config.css.bundle === true && config.css.file !== null){
        var cssFile = config.css.file;
        if(fs.existsSync(cssFile) === true){
            CSSBundle += csso.minify(fs.readFileSync(cssFile, "utf-8"), {
                filename:cssFile
            });
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
            //imp means the imported object
            var imp = importHandler(Import);

            var documentFolder = imp.path.replace(/(\w|\n)+\.js/g, "");
            //FIXME::::::::::::::: Abstraction move into import object
            var componentSourceCode = fs.readFileSync(entryFolder + imp.path.replace(/(\.|\.\/)/, ""), "utf-8");
            componentSourceCode = componentSourceCode.replace(/export default function\s*\(/, "function e(");
            componentSourceCode = componentSourceCode.replace(/export default function/, "function");
            //::::::::::::::::::::
            
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

            var css = existsRead(CSSPath).replace(/\s+/g, " ");
            var html = "a7.documentFragment(" + htmlCompiler(existsRead(htmlPath)) + ")";
            //replace literals
            templateLiterals = html.match(/{{\s*.+?\s*}}/);

            if(templateLiterals !== null){
                templateLiterals.forEach(function(literal){
                    var cleanLiteral = literal.replace(/({{|}})/g, "");
                    html = html.replace(literal, "\'+"+cleanLiteral+"+\'");
                });
            }
            var cssObject = cssSplitter(css, componentTag);
            var cssRules = cssObject.innerStyles.match(/.+?\s*?\{.+?\}/g);
            if(cssRules !== null){
                cssRules.forEach(function (rule){
                    CSSBundle += ".a7-component." + componentTag+ " " + rule;
                });
            }

            if (cssObject.container != ""){
                CSSBundle += cssObject.container;
            }
            //FIXME:::::::::::::::::::::
            var componentOutput = componentSourceCode.replace(componentSetup, "return " + html);
            componentOutput = componentOutput.replace(/((\'\')\s*\+\s*|(\s*\+\s*\'\'))/g, "");
            componentOutput = minifier(componentOutput);
            //::::::::::::::::::::::::::
            var executableComponent = "/* " + imp.name + " */a7.registerComponent(\""+componentTag+"\"," + componentOutput + ");function "+imp.name+"(a){return a7.createElement(\""+componentTag+"\",a)}";
            sourceCode = sourceCode.replace(Import, executableComponent);
            imports += {from:imp.path,as:imp.name};
        });
    }

    if (wholeImports !== null){
        this.imports += wholeImports.length;
        wholeImports.forEach(Import => {
            var imp = importHandler(Import);
            console.log(imp);
            
            //if the package is a7js, it will go searching for it 
            if(imp.path === "a7js"){
                imp.path = require.resolve("../../src/a7.js");
            } else if(imp.path.charAt(0) === "."){
                imp.path = imp.path.replace(".", "./app");
            } else {
                imp.path = require.resolve(imp.path);
            }

            var moduleSourceCode = fs.readFileSync(imp.path, "utf-8");
            var modulesImports = moduleSourceCode.match(/(import\s+.+?\s+from\".*?\"|require\(.*?\))/g);

            if(modulesImports !== null){
                core.errorLog("Module " + imp.name +" has its own imports which we cannot right now import with our detections!");
            }

            if(config.mode === "production"){
                moduleSourceCode = minifier(moduleSourceCode);
            }

            var exportName = "";
            var moduleExport = moduleSourceCode.match(moduleExportEquals);
            if(moduleExport !== null){
                moduleSourceCode = moduleSourceCode.replace(moduleExport[0], "");
                exportName = moduleExport[0].replace(/(module.exports\s*=\s*|;)/g, "");

            }

            var importedModule = `;(function(){${moduleSourceCode} a7importBridgeAPI.${imp.name}=${exportName};})();var ${imp.name}=a7importBridgeAPI.${imp.name};`;

            if(config.mode === "production"){
                importedModule = minifier(importedModule);
            }
            //replacing the import on the sourcecode with the modules contens
            sourceCode = sourceCode.replace(Import, "/* " + imp.name + " */" + importedModule);
            imports += {
                from:imp.path,
                as:imp.name
            };
        });
    }

    if (partialImports !== null){
        this.imports += partialImports.length;
        partialImports.forEach(Import =>{
            var imp = importHandler(Import);
        });
        return core.errorLog("Importing only a part of a framework or a library is not yet supported!");
    }

    if (CSSBundle != ""){
        sourceCode += "a7.loadCSS(\""+ cssMinifier(CSSBundle) + "\")";
    }

    if (config.mode === "production"){
        sourceCode = uglifyJS.minify("(function(){" + sourceCode + "})()", {
            compress:{passes:1},
            mangle:{toplevel:true}
        }).code;
    }
    core.successLog("app was built.");
    return sourceCode;
};