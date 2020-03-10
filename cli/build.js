const fs = require("fs");
const core = require("./core/core");
const compile = require("./compiler/compiler");
module.exports = ()=>{
    if(core.configLoaded === false) return core.errorLog("can't run build command on this directory."); 

    core.config.mode = "production";
    var config = core.config;
    if (config.entry === undefined) return core.errorLog("You have not defined the entrypoint of your app.");
    
    var file = fs.readFileSync(config.entry, "utf-8");
    fs.writeFileSync(config.output, compile(file));
    core.successLog("app was built.");
};