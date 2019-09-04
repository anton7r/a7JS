const fs = require("fs");
const UglifyJS  = require("uglify-js");


var pathToMainFile = "./src/a7.js";
var outputPath = "./dist/a7.js";
var mainfile = fs.readFileSync(pathToMainFile, "utf-8");

var minified = UglifyJS.minify(mainfile);


fs.writeFileSync(outputPath, minified.code);