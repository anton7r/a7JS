#!/usr/bin/env node
const [,,...args] = process.argv;
const core = require("./core/core");
const programs = require("./cli-apps");
const chalk = require("chalk");

if (args[0]===undefined){
    programs.default();
} else if (programs[args[0]]!==undefined){
    programs[args[0]](args[1]);
} else {
    core.errorLog(`${chalk.cyan(args.join(" "))} is not a valid sub program.`);
}