#!/usr/bin/env node
const log = console.log; 
const fs = require("fs");
const chalk = require("chalk");
// arguments
const [,, ...args] = process.argv;
const endbar = "======================================";

const a7greet = function(){
    log();
    log("================",chalk.blue("a7JS"), "================");
    log("installed version:",chalk.green("v3.1.3"));
    log();
};

const a7helper = function(){
    log("=============",chalk.blue("a7JS Help"), "==============");
    log(chalk.cyan("newproject"), "- create a new project with a7.");
    log(endbar);

};

const a7newproject = function(name){
    if(name === undefined){
        return log(chalk.red("ERROR:"), "name of the project is not defined.");
    }

    log(chalk.cyan("creating a new project in .\\" + name));
    fs.appendFile("test.txt", "testing file", function(err){
        if(err) {
            throw error;
        }
        log(chalk.green("SUCCESS:"), "test.txt was created.");
    });
};

const a7unknownArg = function(){
    log(chalk.red("ERROR:"), chalk.cyan(args.join(" ")), "is not a valid argument.");
};
switch (args[0]){
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