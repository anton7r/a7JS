const fs = require("fs");

var pathToMainFile = "./src/a7.js";
var outputPath = "./dist/a7.js";
var mainfile = fs.readFileSync(pathToMainFile, "utf-8");

var minified = mainfile;

fs.writeFileSync(outputPath, minified);