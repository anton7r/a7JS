const core = require("./core/core.js");
const fs = require("fs");
if(core.config)

if(core.config.devserver !== undefined){
    delete core.config.devserver;
}

fs.writeFile("./a7.config.json", JSON.stringify(core.config, null, 4), err => {
    if (err !== null){
        core.errorLog("We have ran into a problem while trying to upgrade your configuration file");
    }
});