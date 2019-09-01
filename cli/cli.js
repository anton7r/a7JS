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

    fs.writeFile(name + "/a7.config.json", "{\n    \"mode\":\"development\"\n    \"output\":\"build.js\"}", function (err) {
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
    var jsFileList = [],
    bundled = "",
    config;
    function builder1(){
        if(config.mode === "development"){
            log("Building a7 project in \"development\" mode.");
        } else if (config.mode === "production"){
            log("Building a7 project in \"production\" mode.");
        } else {
            return log(chalk.red("a7.config.json error:"), "mode can be either \"development\" or \"production\". mode is currently set as", chalk.red("\""+config.mode + "\"."));
        }

        var i,
        listlen = jsFileList.length;

        for(i = 0; i < listlen; i++){
            fs.readFile("js/"+jsFileList[i], function(err, data){
                if(err){
                    log(err);
                }
                bundled += data;
                if (i === listlen){
                    compressAndTranspile();
                }
            });
        }

    }

    var compressAndTranspile = function(){
        var orginalLength = bundled.length;

        bundled = bundled.replace(/\n/g, "") //put into a single line
        .replace(/\s+/g, " ") //remove extra white space
        .replace(/(\s|)=(\s|)/g, "=") //removes spaces around "=" signs
        .replace(/(\s|){(\s|)/g, "{") //removes spaces around "{}"
        .replace(/(\s|)}(\s|)/g, "}")
        .replace(/(\s|)\((\s|)/g, "(") //removes spaces around "()"
        .replace(/(\s|)\)(\s|)/g, ")")
        .replace(/(\s|);(\s|)/g, ";") //removes spaces around colons and semicolons
        .replace(/(\s|),(\s|)/g, ",");
        //transpiling here
        var bundleLength = bundled.length,
        i = 0;
        log(chalk.red("orginal size:"), (orginalLength/1024).toFixed(2), "KB");
        log(chalk.green("bundle size:"), (bundleLength/1024).toFixed(2), "KB");

        //find a7.render
        var a7renderStartLocations = [],
        a7renderEndLocations = [];

        for(i = 0; i < bundleLength; i++){
            start = i + bundled.substring(i, bundleLength).indexOf("a7.render(");
            if(start !== -1){
                end = start + bundled.substring(start, bundleLength).indexOf(")");
                a7renderStartLocations.push(start);
                a7renderEndLocations.push(end);
                i = end;
                log(end);
            } else {
                outputBundle();
                break;
            }
        }
        console.log(a7renderStartLocations, a7renderEndLocations);
    };

    var outputBundle = function (){
        if(config.output === undefined){
            config.output = "build.js";
        }
        fs.writeFile(config.output, bundled, function(err){
            if(err){
                log(err);
            }
        });
    };

    fs.readdir("js/", function(err, list){
        if(err){
            console.log(err);
        } else {
            jsFileList = list;
        }
    });
    fs.readFile("./a7.config.json", function(err, file){
        if (err){
            console.log(err);
        }
        config = JSON.parse(file);
        builder1();
    });

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