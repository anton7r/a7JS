/* jshint -W104 */
/* jshint -W119 */
const fs = require("fs");
const core = require("./cli-core.js");
const importer = require("./cli-importer");

module.exports = function(settings) {
    var silent;

    //loads passed in settings
    if (settings !== undefined) {
        if (settings.silent === true){
            silent = true;
        }

    } else {
        silent = false;
    }

    var config = JSON.parse(fs.readFileSync("./a7.config.json", "utf-8"));

    if (config.entry === undefined){
        core.errorLog("You have not defined the entrypoint of your app.");
        return;
    } 
    else {
        if(silent === false){
            core.infoLog("config was successfully loaded.");
        }
    }
    fs.writeFileSync(config.output, importer(fs.readFileSync(config.entry, "utf-8")));
};