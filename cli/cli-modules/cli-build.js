/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const core = require("./cli-core.js");
const importer = require("./cli-importer");

module.exports = function(settings) {
    var silent;

    //loads passed in settings a.k.a parameters
    if (settings !== undefined) {
        if (settings.silent === true){
            silent = true;
        }
    } else {
        silent = false;
    }
    
    var config = core.config;

    if (config.entry === undefined){
        return core.errorLog("You have not defined the entrypoint of your app.");
    } 
    else {
        if(silent === false){
            core.infoLog("config was successfully loaded.");
        }
    }
    fs.writeFileSync(config.output, importer(fs.readFileSync(config.entry, "utf-8")));
};