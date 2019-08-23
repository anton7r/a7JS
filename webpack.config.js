const path = require("path");

module.exports = {
    entry: './src/a7.js',
    output:{
        path: path.resolve(__dirname,"dist"),
        filename:"a7.js"
    }
};