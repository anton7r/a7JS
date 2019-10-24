/* jshint -W104 */
/* jshint -W119 */

const clicore = require("./cli-core");
const csso = require("csso");

module.exports = function minifier(css){

    try {
        var min = csso.minify(css);
        return min.css;
    
    }
    
    catch(e){
        clicore.errorLog("Could not minify css.");
        return css.replace(/\n\r/g, "");
    }

};