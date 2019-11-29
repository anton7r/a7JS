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
    source = purePath(source);
    try {
        var min = uglifyJS.minify(source);
        if(min.code === undefined){
            return source;
        }
        return min.code;
    } catch (e){
        core.errorLog("an error happened while trying to minify a script");
        return source;
    }
};

const multiReplace = function(from){
    const args = arguments;
    for(let i = 1; i < arguments.length; i++){
        let c = args[i];
        from = from.replace(c[0], c[1]);
    }
    return from;
}

const existsRead = function (path){
    if(fs.existsSync(path)){
        return fs.readFileSync(path, "utf-8");
    } else {
        core.errorLog("file could not be located. "+ path);
        return process.exit(); 
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
    this.path = imp.match(/(\"|\').+(\"|\')/i)[0].replace(/\"/g, "");
    this.name = imp.replace(/import\s*/, "").replace(/\s*from\s*\".+?\";*/, "");
    return this;
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
    sourceCode = "var a7importBridgeAPI = {};\n" + sourceCode;
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
            //path to component folder
            var folder = purePath(entryFolder +imp.path.replace(/(\w|\n)+\.js/g, ""));
            
            //Component sourcecode
            var componentSrc = multiReplace(
                existsRead(entryFolder + imp.path),
                [/export default function\s*\(/, "function e("],
                [/export default function/, "function"]
            );

            var componentSetup = componentSrc.match(/return\s*\(\{(.|\s)*\}\)/)[0];
            var htmlPath = componentSource(findProp(componentSetup, "template"));
            var CSSPath = componentSource(findProp(componentSetup, "styles"));
            var tag = findProp(componentSetup, "tag");
            tag = tag.match(/\".+?\"/)[0].replace(/\"/g, "");
            
            htmlPath = purePath(folder + htmlPath);
            CSSPath = purePath(folder + CSSPath);

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
            var cssObject = cssSplitter(css, tag);
            var cssRules = cssObject.innerStyles.match(/.+?\s*?\{.+?\}/g);
            if(cssRules !== null){
                cssRules.forEach(function (rule){
                    CSSBundle += ".a7-component." + tag+ " " + rule;
                });
            }

            if (cssObject.container != ""){
                CSSBundle += cssObject.container;
            }
            var out = componentSrc.replace(componentSetup, "return " + html);
            out = out.replace(/((\'\')\s*\+\s*|(\s*\+\s*\'\'))/g, "");
            out = minifier(out);
            var exec = "/* " + imp.name + " */a7.registerComponent(\""+tag+"\"," + out + ");function "+imp.name+"(a){return a7.createElement(\""+tag+"\",a)}";
            sourceCode = sourceCode.replace(Import, exec);
            imports += {from:imp.path,as:imp.name};
        });
    }

    if (wholeImports !== null){
        this.imports += wholeImports.length;
        wholeImports.forEach(Import => {
            var imp = importHandler(Import);
            
            //if the package is a7js, it will go searching for it 
            if(imp.path === "a7js"){
                imp.path = require.resolve("../../src/a7.js");
            } else if(imp.path.charAt(0) === "."){
                imp.path = purePath("./app/" + imp.path)
            } else {
                imp.path = require.resolve(imp.path);
            }
            //modSrc is moduleSourceCode
            var modSrc = fs.readFileSync(imp.path, "utf-8");
            //modImp finds modules imports
            var modImp = modSrc.match(/(import\s+.+?\s+from\".*?\"|require\(.*?\))/g);

            if(modImp !== null){
                core.errorLog("Module " + imp.name +" has its own imports which we cannot right now import with our detections!");
                return;
            } else if(config.mode === "production"){
                modSrc = minifier(modSrc);
            }

            var exportName = "";
            var modExp = modSrc.match(moduleExportEquals);
            if(modExp !== null){
                modSrc = modSrc.replace(modExp[0],"");
                exportName = modExp[0].replace(/(module.exports\s*=\s*|;)/g, "");
            }

            var mod = `;(function(){${modSrc} a7importBridgeAPI.${imp.name}=${exportName};})();var ${imp.name}=a7importBridgeAPI.${imp.name};`;

            if(config.mode === "production"){
                mod = minifier(mod);
            }
            //replacing the import on the sourcecode with the modules contens
            sourceCode = sourceCode.replace(Import, "/* " + imp.name + " */" + mod);
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