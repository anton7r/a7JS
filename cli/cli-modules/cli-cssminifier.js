const csso = require("csso");

module.exports = function(css){
    return csso.minify(css).css;
};