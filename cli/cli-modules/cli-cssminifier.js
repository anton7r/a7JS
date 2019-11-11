/* jshint -W104 */
/* jshint -W119 */
const core = require("./cli-core");
const csso = require("csso");
module.exports = function(css){
    try {
        return csso.minify(css).css;
    }
    catch(e){
        core.errorLog("Could not minify css.");
        return css.replace(/\n\r/g, "");
    }
};