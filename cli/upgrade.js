const core = require("./core/core.js");
const fs = require("fs");

module.exports = function(mode){
    if(mode === undefined){
        console.log(
`Heres the things that you can upgrade:
config - used for removing deprecated things from configuration file. you may even repair broken configuration files with this
        `);
    } else if (mode === "config"){
        if(core.config.devserver !== undefined){
            delete core.config.devserver;
        }
        fs.writeFile("./a7.config.json", JSON.stringify(core.config, null, 4), err => {
            if (err !== null){
                core.errorLog("We have ran into a problem while trying to upgrade your configuration file");
            }
        });
    }
}