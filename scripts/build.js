/*
const fs = require("fs");
const uglifyJS = require("uglify-js");
var path = require.resolve("../src/a7.js");
var output = "./build/a7.js";
var file = fs.readFileSync(path, "utf-8");
var minified = uglifyJS.minify(file);
if(fs.existsSync("./build") !== true){
    fs.mkdirSync("./build");
}
fs.writeFileSync(output, minified.code);
*/