const path = require("path");

module.exports = {
    mode: "production",
    entry: './src/a7.js',
    output:{
        path: path.resolve(__dirname,"dist"),
        filename:"a7.js"
    }
};