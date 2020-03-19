const fs = require("fs");
const fsx = require("../core/fsx");
const terser = require("terser");
const core = require("../core/core");
const cssMinifier = require("./css-minifier");
const htmlCompiler = require("./html-compiler");
const csso = require("csso");
var config = core.config;
const safeMatch = require("../utils/safematch");
const exit = require("../utils/exit");

const minifier = src => {
    try {
        var m = terser.minify(src);
        if (m.code === undefined) return src;
        return m.code;
    } catch (e) {
        core.errorLog("an error happened while trying to minify a script");
        return src;
    }
};

function minifyCreateElement(src) {
    return src.replace(/a7.createElement/g, "a7.e").replace(/document./g, "d.");
}

//replace multiple things from a string;
function multiReplace(s){
    const a=arguments;
    for(var i=1;i<a.length;i++)s=s.replace(a[i][0],a[i][1]);
    return s;
};

const existsRead = path => {
    path = fsx.purePath(path);
    if (fs.existsSync(path)) return fs.readFileSync(path, "utf-8");
    core.errorLog("file could not be located. " + path);
    exit();
};

const importParser = imp => {
    this.path = imp.match(/(\"|\').+(\"|\')/i)[0].replace(/\"/g, "");
    this.name = imp.replace(/import\s*/, "").replace(/\s*from\s*\".+?\";*/, "");
    return this;
};

module.exports = src => {
    src = "var d=document;"+src;

    if (config.entry === "noEntry") {
        core.errorLog("no entry to your application was defined in a7.config.json");
        exit();
    }

    let entryFolder = fsx.folderFile(config.entry);
    var CSSBundle = "";


    //TODO: make it testable
    function handleComponentCss(path, name){

        var css = existsRead(path);
        
        //TODO: match all rules and then match all @supports and @keyframes and then remove the incorrect selectors;
        var rules = safeMatch(css, /(@|)[\#\.\w\-\,\s\n\r\t:]+(?=\s*\{)/gi);

        for(var i = 0; i < rules.length; i++) {
            if(rules[i].indexOf("@") !== 0){
                
            }
        }

        setTimeout(function(){
            console.log(rules);
        }, 500);

        CSSBundle += css;
    }

    if (config.css.bundle && config.css.file !== null) {
        var cssFile = config.css.file;
        if (fs.existsSync(cssFile)) {
            CSSBundle += csso.minify(fs.readFileSync(cssFile, "utf-8"), {
                filename: cssFile
            });
        }
    }

    var imports = [];
    var componentImports = safeMatch(src, /import\s+(\d|\w|\_)+\s+from\s*\"\.\/components\/.+?\";*/gi);
    var wholeImports = safeMatch(src, /import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);

    //Whole imports eliminate component imports
    wholeImports = wholeImports.filter(val => {
        if (val.match(/"\.\/components\/.+?\"/) !== null) return false;
        else return true;
    });

    var partialImports = safeMatch(src, /import\s*{\s*.*?\s*}\s+from\s*\".+?\";*/gi);


    //Component


    for (let i = 0; i < componentImports.length; i++) {
        var Import = componentImports[i];
        var imp = importParser(Import);
        var folder = fsx.purePath(entryFolder + imp.path.replace(/(\w|\n)+\.js/g, ""));

        //Component src
        var componentSrc = existsRead(entryFolder + imp.path).replace(/export default\s*/, "").replace(/;$/, "");

        var htmlPath = folder + imp.name + ".html";
        var CSSPath = folder + imp.name + ".css";
        var tag = imp.name;

        handleComponentCss(CSSPath);

        var html = htmlCompiler(existsRead(htmlPath), htmlPath);
        //replace literals
        templateLiterals = safeMatch(html, /{{\s*.+?\s*}}/g);
        templateLiterals.forEach(literal => {
            var clean = literal.replace(/({{|}})/g, "").replace(/\s/g, "");
            html = html.replace(literal, `\'+this.data.${clean}+\'`);
        });

        html = minifyCreateElement(html);

        object = componentSrc.replace(/^{/, "").replace(/}$/, "");
        objectWithRenderer = object + `,render(){return ${html}}`.replace(/,,/g, ",")

        var out = multiReplace(componentSrc,
            [object, objectWithRenderer],
            [/((\'\')\s*\+\s*|(\s*\+\s*\'\'))/g, ""]
        );

        out = out.replace(/(\r|)\n(\s+|)/g, "")

        out = `a7.registerComponent(\"${tag}\",${out});function ${imp.name}(a){return a7.e(\"${tag}\",a)}`;
        src = src.replace(Import, out);
        imports += {
            from: imp.path,
            as: imp.name
        };
    }

    for (let i = 0; i < wholeImports.length; i++) {
        var isSelf = false;
        var Import = wholeImports[i];
        var imp = importParser(Import);

        //if the package is a7js, it will go searching for it 
        if (imp.path === "a7js"){
            imp.path = require.resolve("../../src/a7.js");
            isSelf = true;
        } else if (imp.path.charAt(0) === ".") imp.path = fsx.purePath("./app/" + imp.path);
        else imp.path = require.resolve(imp.path);

        var modSrc = fs.readFileSync(imp.path, "utf-8");
        //modImp finds modules imports
        var modImp = modSrc.match(/(import\s+.+?\s+from\".*?\"|require\(.*?\))/g);
        if (modImp !== null) return core.errorLog(`Module ${imp.name} has its own imports which we cannot right now import with our detections!`);

        var expName = "";
        var modExp = modSrc.match(/module.exports\s*=\s*[\w\d]*;*/g);
        if (modExp !== null) {
            modSrc = modSrc.replace(modExp[0], "");
            expName = modExp[0].replace(/(module.exports\s*=\s*|;)/g, "");
        }

        if(isSelf) modSrc = minifyCreateElement(modSrc)

        var mod = `;var ${imp.name}=function(){${modSrc} return ${expName}}();`;

        if (config.mode === "production") mod = minifier(mod);

        //replacing the import on the src with the modules contens
        src = src.replace(Import, mod);
        imports += {
            from: imp.path,
            as: imp.name
        };
    }

    var len = partialImports.length;
    if (len > 0) return core.errorLog("Importing only a part of a framework or a library is not yet supported!");
    for (let i = 0; i < len; i++) {
        var Import = partialImports[i];
        var imp = importParser(Import);
    }

    if (CSSBundle != "") src += `a7.loadCSS(\"${cssMinifier(CSSBundle)}\")`;
    if (config.mode === "production") {
        var min = terser.minify(`(function(){${src}})()`, {
            parse:{
                ecma: 2018
            },
            compress: {
                ecma: 5,
                hoist_funs:true,
                hoist_vars:true,
                hoist_props:true
            },
            mangle: {
                toplevel: true,
                properties: true,
            },
            output: {
                ecma: 5
            },
        });

        if (min.error !== undefined) {
            core.errorLog("Terser found an error in your code: " + min.error.message);
        } else src = min.code;
    }
    return src;
};