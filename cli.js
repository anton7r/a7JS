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
    <script src="/js/app.js"></script>
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
const jsDoc = `var app = a7.app;

app.routes = {
    "/*": "home"
};
app.pages = {
    home:{
        title:"Home",
        description:"Welcome to my site",
        onRoute:function(){
            a7.render(
                a7.createElement("h1", "", "Welcome to a7JS!")
            );
        }
    }
};`

const a7greet = function () {
    log();
    log("================", chalk.blue("a7JS"), "================");
    log("installed version:", chalk.green("v3.1.3"));
    log();
};

const a7helper = function () {
    log("=============", chalk.blue("a7JS Help"), "==============");
    log(chalk.cyan("newproject"), "- create a new project with a7.");
    log(endbar);

};

const a7newproject = function (name) {

    if (name === undefined) {

        return log(chalk.red("ERROR:"), "name of the project is not defined.");

    } else if (fs.existsSync(name) !== false) {

        return log(chalk.red("ERROR:"), name, "folder already exists.");

    }

    log(chalk.cyan("creating a new project in /" + name + "/"));

    fs.mkdir(name, {
        recursive: true
    }, function (err) {

        if (err) {
            log(chalk.red("ERROR:"), "there was an error while creating project folder.");
        } else {
            log(chalk.green("SUCCESS:"), "project folder was created.");
        }
    });
    fs.writeFile(name + "/index.html", createHtmlDoc(name), function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        } else {}
    });
    fs.mkdir(name + "/css", {
        recursive: true
    }, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "css folder could not be created.");
        } else {

        }
    });
    fs.writeFile(name + "/css/style.css", cssDoc, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        } else {}
    });
    fs.mkdir(name + "/js", {
        recursive: true
    }, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "js folder could not be created.");
        } else {

        }
    });
    fs.writeFile(name + "/js/index.js", jsDoc, function (err) {
        if (err) {
            log(chalk.red("ERROR:"), "index.html could not be created.");
        } else {}
    });
    log(chalk.green("SUCCESS:"), "The Project was created without any errors!");
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
    default:
        a7unknownArg();
        break;
}