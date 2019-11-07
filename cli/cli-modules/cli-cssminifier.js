/* jshint -W104 */
/* jshint -W119 */

const core = require("./cli-core");
const csso = require("csso");

module.exports = function minifier(css){

    try {
        var min = csso.minify(css);
        return min.css;
    
    }
    
    catch(e){
        core.errorLog("Could not minify css.");
        return css.replace(/\n\r/g, "");
    }

};