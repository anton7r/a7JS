const fs = require("fs");
const fsx = require("../core/fsx");
const uglifyJS = require("uglify-js");
const core = require("../core/core");
const cssMinifier = require("./css-minifier");
const htmlCompiler = require("./html-compiler");
const csso = require("csso");
var config = core.config;
const safeMatch = require("./safematch");

const minifier = src => {
    try {
        var m = uglifyJS.minify(src);
        if(m.code === undefined) return src;
        return m.code;
    } catch(e){
        core.errorLog("an error happened while trying to minify a script");
        return src;
    }
};

//replace multiple things from a string;
const multiReplace = s => {
    const a = arguments;
    for(let i = 1; i < a.length; i++){
        s = s.replace(a[i][0], a[i][1]);
    }
    return s;
};

const existsRead = path => {
    path = fsx.purePath(path);
    if(fs.existsSync(path)) return fs.readFileSync(path, "utf-8");
    core.errorLog("file could not be located. "+ path);
    process.exit();
};

const importHandler = imp => {
    this.path = imp.match(/(\"|\').+(\"|\')/i)[0].replace(/\"/g, "");
    this.name = imp.replace(/import\s*/, "").replace(/\s*from\s*\".+?\";*/, "");
    return this;
};

module.exports = sourceCode => {
    sourceCode = "var a7_i={};\n" + sourceCode;
    if(config.entry === "noEntry"){
        core.errorLog("no entry to your application was defined in a7.config.json");
        process.exit();
    }
    let entryFolder = config.entry.replace(/(\w|\d)+\.js/i, "");
    var CSSBundle = "";
    
    if(config.css.bundle && config.css.file !== null){
        var cssFile = config.css.file;
        if(fs.existsSync(cssFile)){
            CSSBundle += csso.minify(fs.readFileSync(cssFile, "utf-8"), {
                filename:cssFile
            });
        }
    }

    var imports = [];
    var componentImports = safeMatch(sourceCode, /import\s+(\d|\w|\_)+\s+from\s*\"\.\/components\/.+?\";*/gi);
    var wholeImports = safeMatch(sourceCode, /import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);

    //Whole imports eliminate component imports
    wholeImports = wholeImports.filter(val => {
        if(val.match(/"\.\/components\/.+?\"/) !== null) return false;
        else return true;
    });

    var partialImports = safeMatch(sourceCode, /import\s*{\s*.*?\s*}\s+from\s*\".+?\";*/gi);

    //Goes through component imports
    for(let i = 0; i < componentImports.length; i++){
        var Import = componentImports[i];
        //imp means the imported object
        var imp = importHandler(Import);
        //path to component folder
        var folder = fsx.purePath(entryFolder +imp.path.replace(/(\w|\n)+\.js/g, ""));
        
        //Component sourcecode
        var componentSrc = existsRead(entryFolder + imp.path).replace(/export default\s*/, "");

        var htmlPath = folder + imp.name + ".html";
        var CSSPath = folder + imp.name + ".css";
        var tag = imp.name;

        CSSBundle += existsRead(CSSPath).replace(/\s+/g, " ");
        var html = `a7.documentFragment(${htmlCompiler(existsRead(htmlPath), htmlPath)})`;
        //replace literals
        templateLiterals = safeMatch(html, /{{\s*.+?\s*}}/g);
        templateLiterals.forEach(literal => {
            var clean = literal.replace(/({{|}})/g, "").replace(/\s/g, "");
            html = html.replace(literal, `\'+this.data.${clean}+\'`);
        });

        object = componentSrc.replace(/^{/, "").replace(/}$/, "");
        objectWithRenderer = object + `,render(){return ${html}}`.replace(/,,/g, ",")        

        var out = minifier(multiReplace(componentSrc,
            [object, objectWithRenderer],
            [/((\'\')\s*\+\s*|(\s*\+\s*\'\'))/g, ""]
        ));

        var exec = `a7.registerComponent(\"${tag}\",${out});function ${imp.name}(a){return a7.createElement(\"${tag}\",a)}`;
        sourceCode = sourceCode.replace(Import, exec);
        imports += {from:imp.path,as:imp.name};
    }

    for (let i = 0; i < wholeImports.length; i++){
        var Import = wholeImports[i];
        var imp = importHandler(Import);
        
        //if the package is a7js, it will go searching for it 
        if(imp.path === "a7js"){
            imp.path = require.resolve("../../src/a7.js");
        } else if(imp.path.charAt(0) === "."){
            imp.path = fsx.purePath("./app/" + imp.path);
        } else {
            imp.path = require.resolve(imp.path);
        }
        var modSrc = fs.readFileSync(imp.path, "utf-8");
        //modImp finds modules imports
        var modImp = modSrc.match(/(import\s+.+?\s+from\".*?\"|require\(.*?\))/g);
        if(modImp !== null){
            core.errorLog(`Module ${imp.name} has its own imports which we cannot right now import with our detections!`);
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
        sourceCode = sourceCode.replace(Import, `/* ${imp.name} */ ${mod}`);
        imports += {
            from:imp.path,
            as:imp.name
        };
    }

    var len = partialImports.length;
    if (len > 0) return core.errorLog("Importing only a part of a framework or a library is not yet supported!");
    for(let i = 0; i < len; i++){
        var Import = partialImports[i];
        var imp = importHandler(Import);
    }

    if (CSSBundle != "") sourceCode += "a7.loadCSS(\""+cssMinifier(CSSBundle)+"\")";
    if (config.mode === "production"){
        var min = uglifyJS.minify(`(function(){${sourceCode}})()`, {
            compress:{passes:1}, mangle:{toplevel:true}
        });

        if(min.error !== undefined){
            core.errorLog("UglifyJS found an error in your code\n\n" + min.error);
            process.exit();
        }
        sourceCode = min.code;
    }
    return sourceCode;
};