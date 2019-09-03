#!/usr/bin/env node

const log = console.log;
const fs = require("fs");
const chalk = require("chalk");
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
    <script type="module" src="/build.js"></script>
</body>
</html>`].join("");
};
const cssDoc = `:root{
    --main-color:black;
    --bg-color:white;
}

* {
    margin:0px;
    padding:0px;
}`;
const jsDoc = `const a7 = require("a7");
import a7 from "a7.js"

a7.routes = {
    "/*": home
};
var home = function(){
    a7.render(
        <div class="hello">I am Hello</div>
    )
};
`

const a7greet = function () {
    log();
    log("================", chalk.blue("a7JS"), "================");
    log("installed version:", chalk.green("v4-pre"));
    log();
};

const a7helper = function () {
    log("=============", chalk.blue("a7JS Help"), "==============");
    log(chalk.cyan("newproject"), "- create a new project with a7.");
    log(chalk.cyan("build"), "- build the a7 project.");
    log(endbar);

};

const a7newproject = function (name) {

    if (name === undefined) {
        return log(chalk.red("ERROR:"), "name of the project is not defined.");
    } else if (fs.existsSync(name) !== false) {
        return log(chalk.red("ERROR:"), name, "folder already exists.");
    }

    log(chalk.cyan("creating a new project in " + name));

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
        }
    });

    fs.mkdirSync([name,"/js"].join(""));

    fs.writeFile(name + "/index.html", createHtmlDoc(name), function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        }
    });

    fs.mkdir(name + "/css", {
        recursive: true
    }, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "css folder could not be created.");
        }
    });

    fs.writeFile(name + "/css/style.css", cssDoc, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "css file could not be created.");
        }
    });

    fs.writeFile(name + "/a7.config.json", "{\n        \"mode\":\"development\",\n        \"entry\":\"./app/index.js\",\n        \"output\":\"appbuild.js\"\n    }", function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "config could not be created.");
        }
    });

    fs.writeFile(name + "/js/index.js", jsDoc, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        }
    });

    log(chalk.green("SUCCESS:"), "The Project was created without any errors!");
};

const a7build = function() {
    var config = JSON.parse(fs.readFileSync("./a7.config.json", "utf-8"));
    if(config.entry === undefined){
        log("You have not defined the entrypoint of your app.");
    }
    var mainFile = fs.readFileSync(config.entry, "utf-8"),
    pathToA7JS = require.resolve("../dist/a7.js");

    mainFile = mainFile.replace(/import a7 from \"@a7JS\"(;|)/i, fs.readFileSync(pathToA7JS, "utf-8"));
    log(mainFile);
};

const a7unknownArg = function () {
    log(chalk.red("ERROR:"), chalk.cyan(args.join(" ")), "is not a valid argument.");
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
    case "build":
        a7build();
        break;
    default:
        a7unknownArg();
        break;
}