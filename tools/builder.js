const fs = require("fs");
const UglifyJS  = require("uglify-js");
const chalk = require("chalk");
const log = console.log;

var pathToMainFile = "./src/a7.js";
var outputPath = "./dist/a7.js";
log(chalk.yellow("Starting build process"));

var mainfile = fs.readFileSync(pathToMainFile, "utf-8");
var minified = UglifyJS.minify(mainfile);

fs.writeFileSync(outputPath, minified.code);
log(chalk.green("Build done."));