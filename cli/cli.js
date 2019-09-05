#!/usr/bin/env node

const log = console.log;
const fs = require("fs");
const chalk = require("chalk");
const UglifyJS = require("uglify-js"),
pathToA7JS = require.resolve("../dist/a7.js");

//TODO:
function successLog (msg){
    log(chalk.green("SUCCESS:"), msg);
}

function errorLog (msg){
    log(chalk.red("ERROR:"), msg) ;
}

function infoLog (msg){
    log(chalk.cyan("INFO:"), msg);
}

function fileCreatedLog (fileName, fileByteSize){
    log(chalk.cyan("INFO:"), " file", fileName, "was created.");
}

function helperLog (argument, text){
    log(chalk.cyan(argument), "-", text);
}

function syntaxLog (syntax){
    log(chalk.gray(" - Syntax: " + syntax));
}

// arguments
const [, , ...args] = process.argv;
const endbar = "======================================";

const createHtmlDoc = function (name) {
    return [`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>`, name, `</title>
    <meta name="description" content="`, name, `"></meta>
    <link href="/css/style.css" rel="stylesheet">
</head>
<body>
    <div data-a7-page-container></div>
    <script type="module" src="/appbuild.js"></script>
</body>
</html>`].join("");
};
const cssDoc = `:root{\n    --main-color:black;\n    --bg-color:white;\n}\n\n* {\n    margin:0px;\n    padding:0px;\n}\n\nbody {\n    font:"FONT HERE";\n}`;

const a7greet = function () {
    log();
    log("================", chalk.blue("a7JS"), "================");
    log("installed version:", chalk.green("v4-pre"));
    log();
};

const a7helper = function () {
        log("=============", chalk.blue("a7JS Help"), "==============");
        helperLog("newproject", "create a new project with a7.");
        syntaxLog("a7 newproject [projectname]");
        syntaxLog("a7 np [projectname]");
        helperLog("newcomponent", "create a new component into the current project.");
        syntaxLog("a7 newcomponent [componentname]");
        syntaxLog("a7 nc [componentname]");
        helperLog("build", "build the a7 project.");
        syntaxLog("a7 build");
        log(endbar);
};

const a7newproject = function (name) {
    if (name === undefined) {
        return errorLog("You have not defined a name for your project.");
    } else if (fs.existsSync(name) !== false) {
        return errorLog(name + " folder already exists in this directory.");
    }

    infoLog("creating a new project in " + name);

    fs.mkdir(name, {
        recursive: true
    }, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "there was an error while creating project folder.");
        } else {
            log(chalk.green("SUCCESS:"), "project folder was created.");
        }
    });

    fs.writeFile(name + "/package.json", "empty", function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "package.json could not be created.");
        } else {

        }
    });

    fs.mkdirSync(name +"/app");

    fs.writeFile(name + "/index.html", createHtmlDoc(name), function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        }
    });

    fs.mkdir(name + "/css", {
        recursive: true
    }, function (err) {
        if (err) {
            return errorLog("css folder could not be created.");
        }
    });

    fs.writeFile(name + "/css/style.css", cssDoc, function (err) {
        if (err) {
            return errorLog("css file could not be created.");
        }
    });
    var conf = fs.readFileSync(require.resolve("./project-template/defaultconfig.json"));
    fs.writeFile(name + "/a7.config.json", conf, function (err) {
        if (err) {
            return errorLog("config could not be created.");
        }
    });

    fs.writeFile(name + "/app/index.js", fs.readFileSync(require.resolve("./project-template/index.js")), function (err) {
        if (err) {
            return errorLog("app/index.js could not be created.");
        }
    });

    log(chalk.green("SUCCESS:"), "The Project was created without any errors!");
};
//todo
const a7build = function() {
    var config = JSON.parse(fs.readFileSync("./a7.config.json", "utf-8"));

    if(config.entry === undefined){
        log("You have not defined the entrypoint of your app.");
        return;
    } 
    else {
        log(chalk.cyan("LOADED:"), "config");
    }

    var mainFile = fs.readFileSync(config.entry, "utf-8");

    mainFile = mainFile.replace(/import a7 from \"@a7JS\"(;|)/i, fs.readFileSync(pathToA7JS, "utf-8"));
    var imports = mainFile.match(/import .+ from \".+\"/g);
    if (imports !== null){
        imports.forEach(function(val){
            var pathToComponent = val.match(/".+"/),
            document;
            var documentPath;
            pathToComponent[0] = pathToComponent[0].replace(/\"/g, "");
            if(pathToComponent[0].charAt(0) === "."){
                documentPath = "./app" + pathToComponent[0].replace(/\./, "");
                document = fs.readFileSync(documentPath, "utf-8");
            } else {
                documentPath = pathToComponent[0];
                document = fs.readFileSync(documentPath, "utf-8");
            }
            console.log(document, documentPath);
        });
    } else {
        infoLog("no component imports detected.");
    }

    var minify = UglifyJS.minify(mainFile);
    if(minify.error){
        log(chalk.red("ERROR:"), minify.error.message, minify.error.line + ":" + minify.error.line);
    }

    fs.writeFileSync(config.output, minify.code);
};

const a7createComponent = function(name) {
    var pathToComponents = "./app/";
    var jsFileName = pathToComponents + name + "/" + name + ".js";
    var cssFileName = pathToComponents + name + "/" + name + ".css";
    var htmlFileName = pathToComponents + name + "/" + name + ".html";
    fs.mkdirSync(pathToComponents + "/" + name);
    fs.writeFileSync(jsFileName, "export default {\n    documentSource:\"./"+name+".html\",\n    styleSource:\"./"+name+".css\"\n};");
    fs.writeFileSync(htmlFileName, "");
    fs.writeFileSync(cssFileName, "");
    log("Component", name, chalk.green("created."));
};

const a7unknownArg = function () {
    errorLog(chalk.cyan(args.join(" ")) + " is not a valid argument.");
};

switch (args[0]) {
    case undefined:
        a7greet();
        a7helper();
        break;
    case "help":
        a7helper();
        break;
    case "newproject":
        a7newproject(args[1]);
        break;
    case "np":
        a7newproject(args[1]);
        break;
    case "build":
        a7build();
        break;
    case "newcomponent":
        a7createComponent(args[1]);
        break;
    case "nc":
        a7createComponent(args[1]);
        break;
    default:
        a7unknownArg();
        break;
}