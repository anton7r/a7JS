/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const core = require("./core/core.js");
const compile = require("./compiler/compiler");
module.exports = function(settings) {
    if(core.configLoaded === false){
        return core.errorLog("can't run build command on this directory."); 
    }

    core.config.mode = "production";
    var config = core.config;
    if (config.entry === undefined){
        return core.errorLog("You have not defined the entrypoint of your app.");
    }
    var file = fs.readFileSync(config.entry, "utf-8");
    fs.writeFileSync(config.output, compile(file));
    core.successLog("app was built.");
    
};