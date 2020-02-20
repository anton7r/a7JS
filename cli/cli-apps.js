const log = console.log;
const fs = require("fs");
const chalk = require("chalk");
const core = require("./core/core.js");
var cmd = {
    build:require("./build.js"),
    devserver:require("./dev-server/dev-server.js")
};

const createHtmlDoc = name => {
    return fs.readFileSync(require.resolve("./defaults/index.html"), "utf-8", ()=>{
        core.errorLog("an error happened while trying to generate html index file.");
    }).replace(/\$/g, name);
};

const cssDoc = `* {\n    margin:0px;\n    padding:0px;\n}\n\nbody {\n    font-family:"FONT HERE";\n}`;

cmd.default=()=>{
    log(chalk.blue("A7JS")+chalk.gray("@"+core.getVersion())+"\n");
    core.helperLog("newproject", "create a new project with a7.");
    core.syntaxLog("a7 newproject [projectname]");
    core.syntaxLog("a7 np [projectname]");

    core.helperLog("newcomponent", "create a new component into the current project.");
    core.syntaxLog("a7 newcomponent [componentname]");
    core.syntaxLog("a7 nc [componentname]");

    core.helperLog("build", "build the a7 project.");
    core.syntaxLog("a7 build");

    core.helperLog("devserver", "start a development server");
    core.syntaxLog("a7 devserver [port(optional)]");
};

cmd.np=cmd.newproject=name=>{
    if (name === undefined) {
        return core.errorLog("you have not defined a name for your project.");
    } else if (fs.existsSync(name) !== false) {
        return core.errorLog(name + " folder already exists in this directory.");
    }

    core.infoLog(`creating a new project in ${name}`);

    fs.mkdir(name, {
        recursive: true
    }, err => {
        if (err) return core.errorLog("there was an error while creating project folder.");
    });

    fs.writeFile(name + "/package.json", JSON.stringify({    
        name,
        version:"0.0.1",
        description: `${name} is a A7JS application.`,
        private: true,
        dependencies: {
            "a7js": "^"+core.getVersion()
        },
        main: "app/index.js",
        a7js: {
            metadata: {
                lastUsedVersion: core.getVersion(),
                lastUsedTime: new Date()
            }
        }
    },null, 4), err=>{
        if(err)core.errorLog("package.json could not be created.");
    });

    fs.mkdirSync(name +"/app");
    fs.mkdirSync(name +"/app/components");
    fs.writeFile(name + "/index.html", createHtmlDoc(name), err=>{
        if(err)return core.errorLog("index.html could not be created.");
    });

    fs.writeFile(name + "/app/style.css", cssDoc, err=>{
        if(err)return core.errorLog("css file could not be created.");
    });
    
    var conf = fs.readFileSync(require.resolve("./defaults/config.json"));
    fs.writeFile(name + "/a7.config.json", conf, err=>{
        if(err)return core.errorLog("config could not be created.");
    });

    fs.writeFile(name + "/app/index.js", fs.readFileSync(require.resolve("./defaults/index.js")), err=>{
        if(err)return core.errorLog("app/index.js could not be created.");
    });

    core.successLog("the project was created successfully!");
};
cmd.nc=cmd.newcomponent=(name, rootPath) => {
    var path = `app/components/${name}/`;
    if(rootPath !== undefined) path = rootPath + path;
    else path = "./"+path;
    var jsPath = `${path}${name}.js`;
    var cssPath = `${path}${name}.css`;
    var htmlPath = `${path}${name}.html`;
    var _imports = core.getImports();
    //the last import
    var last = _imports.imports[_imports.imports.length - 1];
    var source = _imports.source.replace(last, `${last};\nimport ${name} from "./components/${name}/${name}.js;`).replace(";;", ";");

    if(core.htmlTags.indexOf(name) !== -1){
        return core.errorLog(name + " is a tag in the html5 specification, please choose a different tag name");
    } else if (fs.existsSync(path + name) === true){
        return core.errorLog(name+" is already defined as a component.");
    }

    fs.writeFile(core.config.entry, source, err=>{
        if (err) core.errorLog("An error happened while trying to add import to component" + name);
        else core.successLog(`Component ${name} was successfully added to imports`);
    });

    fs.mkdirSync(path);
    fs.writeFile(jsPath, fs.readFileSync(require.resolve("./defaults/component.js"), "utf-8").replace(/name/g, name),err=>{
        if(err){
            return core.errorLog("There was an error while generating the js file for " + name + ".");
        } else core.successLog("Component " + name + " was successfully created.");
    });
    var ermsg = ". This is not an big issue but this means that you would have to make the file yourself";
    fs.writeFile(htmlPath, "", err=>{
        if(err) core.errorLog("Couldn't create ./app/" + name + "/" + name + ".html"+ermsg);
    });
    fs.writeFile(cssPath, "", err=>{
        if(err) core.errorLog("Couldn't create ./app/" + name + "/" + name + ".css"+ermsg);
    });
};
//TODO: Move it also to another dir
const http = require("http");

cmd.test = ()=>{
    core.infoLog("starting an automatic a7 tester");
    core.infoLog("this is the tool to find to the most critical bugs in the code.");
    var a7testFolder =  module.filename.replace(/cli(\/|\\)cli\.js/, "tests/");
    var errors = "";
    if(fs.existsSync(a7testFolder) === false){
        fs.mkdirSync(a7testFolder);
        log("folder " + a7testFolder + " was not found. So we added it");
    }
    core.infoLog("the whole log is available in the ./tests/ folder");
    try{
        a7newproject(a7testFolder + "x");
    } catch(err){
        core.errorLog("the project couldn't be created.");
        errors += err+"\n";
    }
    try{
        a7createComponent("test", a7testFolder+ "x/");
    } catch(err){
        core.errorLog("there was an error while trying to create new component.");
        errors += err+"\n";
    }
    try{
        a7devServer("8698", dir);
        http.get("localhost:8698");
    } catch(err){
        core.errorLog("");
        errors += err+"\n";
    }

    //Results
    fs.writeFile(a7testFolder + "errorlog.txt", errors, err=>{
        if(err){
            core.errorLog("could not store error log so here is the log");
            log(errors);
        }
    });
};
module.exports = cmd;