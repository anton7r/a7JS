/* jshint -W104 */
/* jshint -W119 */
/* jshint -W049 */
const fs = require("fs");
const uglifyJS = require("uglify-js");
const core = require("./cli-core");
const cssMinifier = require("./cli-cssminifier");
const htmlCompiler = require("./cli-htmlcompiler");
const csso = require("csso");
var config = core.config;

const minifier = function (source){
    try {
        var m = uglifyJS.minify(source);
        if(m.code === undefined) return source;
        else return m.code;
    } catch (e){
        core.errorLog("an error happened while trying to minify a script");
        return source;
    }
};

//replace multiple things from a string;
const multiReplace = function(s){
    const a = arguments;
    for(let i = 1; i < a.length; i++){
        s = s.replace(a[i][0], a[i][1]);
    }
    return s;
}

const existsRead = function (path){
    path = purePath(path);
    if(fs.existsSync(path)){
        return fs.readFileSync(path, "utf-8");
    }
    core.errorLog("file could not be located. "+ path);
    process.exit();
};

const componentSource = function (str){
    return str.match(/\".+\"/g)[0].replace(/\"/g, "");
};

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

//Searches properties from objects in sourceCode
function findProp (from, find){
    return from.match(new RegExp(find + "\s*:\s*\".+?\"", "i"))[0];
}

//TODO:TODO:TODO:TODO:TODO:TODO:TODO:TODO:TODO:TODO: abstractify
const cssSplitter = function(css, tag){
    //container RegExp
    var containerStylesRx = new RegExp(tag + "(.|\s)+?\{(.|\s)+?\}", "g");
    //TODO: instead of matching them by which are container styles remove them which aren't container styles and it is also the better option for performance
    var notContainerStylesRx = new RegExp();
    var containerStyles = css.match(containerStylesRx);
    var parsedContainerStyles = "";

    if (containerStyles !== null){
        containerStyles.forEach(function(style){
            parsedContainerStyles += style;
        });
    }
    parsedContainerStyles = parsedContainerStyles.replace(new RegExp(tag, "g"), ".a7-component." + tag);
    return {container:parsedContainerStyles,innerStyles:css.replace(containerStylesRx, "")};     
};

module.exports = function(sourceCode){
    sourceCode = "var a7_i={};\n" + sourceCode;
    if(config.entry === "noEntry"){
        core.errorLog("no entry to your application was defined in a7.config.json");
        process.exit();
    }
    let entryFolder = config.entry.replace(/(\w|\d)+\.js/i, "");
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
    var componentImports = sourceCode.match(/import\s+(\d|\w|\_)+\s+from\s*\"\.\/components\/.+?\";*/gi);
    var wholeImports = sourceCode.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);

    //Whole imports eliminate component imports
    wholeImports = wholeImports.filter(function(val){
        if(val.match(/"\.\/components\/.+?\"/) !== null) return false;
        else return true;
    });

    var partialImports = sourceCode.match(/import\s*{\s*.*?\s*}\s+from\s*\".+?\";*/gi);
    //TODO:(Pro tip) make foreach into for loop because it is faster
    
    //Goes through component imports
    var len = 0;
    if (componentImports !== null){
        len = componentImports.length;
    }
    for(let i = 0; i < len; i++){
        var Import = componentImports[i];
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
        var htmlPath = folder + componentSource(findProp(componentSetup, "template"));
        var CSSPath = folder + componentSource(findProp(componentSetup, "styles"));
        var tag = findProp(componentSetup, "tag");
        tag = tag.match(/\".+?\"/)[0].replace(/\"/g, "");

        var css = existsRead(CSSPath).replace(/\s+/g, " ");
        var html = "a7.documentFragment(" + htmlCompiler(existsRead(htmlPath)) + ")";
        //replace literals
        templateLiterals = html.match(/{{\s*.+?\s*}}/);
        if(templateLiterals !== null){
            templateLiterals.forEach(function(literal){
                var clean = literal.replace(/({{|}})/g, "");
                html = html.replace(literal, "\'+"+clean+"+\'");
            });
        }
        var cssObject = cssSplitter(css, tag);
        var cssRules = cssObject.innerStyles.match(/.+?\s*?\{.+?\}/g);
        if(cssRules !== null){
            cssRules.forEach(function (rule){
                CSSBundle += ".a7-component."+tag+" "+rule;
            });
        }

        if (cssObject.container != ""){
            CSSBundle += cssObject.container;
        }

        var out = minifier(multiReplace(componentSrc,
            [componentSetup, "return " + html],
            [/((\'\')\s*\+\s*|(\s*\+\s*\'\'))/g, ""]
        ));

        var exec = "a7.registerComponent(\""+tag+"\","+out+");function "+imp.name+"(a){return a7.createElement(\""+tag+"\",a)}";
        sourceCode = sourceCode.replace(Import, exec);
        imports += {from:imp.path,as:imp.name};
    };

    len = 0;
    if (wholeImports !== null){
        len = wholeImports.length;
    }
    for (let i = 0; i < len; i++){
        var Import = wholeImports[i];
        var imp = importHandler(Import);
        
        //if the package is a7js, it will go searching for it 
        if(imp.path === "a7js"){
            imp.path = require.resolve("../../src/a7.js");
        } else if(imp.path.charAt(0) === "."){
            imp.path = purePath("./app/" + imp.path)
        } else {
            imp.path = require.resolve(imp.path);
        }
        var modSrc = fs.readFileSync(imp.path, "utf-8");
        //modImp finds modules imports
        var modImp = modSrc.match(/(import\s+.+?\s+from\".*?\"|require\(.*?\))/g);
        if(modImp !== null){
            core.errorLog("Module " + imp.name +" has its own imports which we cannot right now import with our detections!");
            return;
        } else if(config.mode === "production"){
            modSrc = minifier(modSrc);
        }

        var expName = "";
        var modExp = modSrc.match(/module.exports\s*=\s*(\w|\d)*;*/g);
        if(modExp !== null){
            modSrc = modSrc.replace(modExp[0],"");
            expName = modExp[0].replace(/(module.exports\s*=\s*|;)/g, "");
        }

        var mod = `;(function(){${modSrc} a7_i.${imp.name}=${expName};})();var ${imp.name}=a7_i.${imp.name};`;

        if(config.mode === "production"){
            mod = minifier(mod);
        }
        //replacing the import on the sourcecode with the modules contens
        sourceCode = sourceCode.replace(Import, "/* " + imp.name + " */" + mod);
        imports += {
            from:imp.path,
            as:imp.name
        };
    };

    len = 0;
    if (partialImports !== null){
        len = partialImports.length;
        return core.errorLog("Importing only a part of a framework or a library is not yet supported!");
    }
    for(let i = 0; i < len; i++){
        var Import = partialImports[i];
        var imp = importHandler(Import);
    };

    if (CSSBundle != ""){
        sourceCode += "a7.loadCSS(\""+cssMinifier(CSSBundle)+"\")";
    }

    if (config.mode === "production"){
        sourceCode = uglifyJS.minify(`(function(){${sourceCode}})()`, {
            compress:{passes:1}, mangle:{toplevel:true}
        }).code;
    }
    core.successLog("app was built.");
    return sourceCode;
};