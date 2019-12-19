//updater script has to run everytime since we cannot know if the project is old or not
const fs = require("fs");
const fsx = require("./core/fsx.js");
const core = require("./core/core");
const ver = require("./core/compare-versions");

//needs to check wether directory has a7 config file
if (fsx.fileExists("./a7.config.json") === false) {
    return;
}

var pk;

if(fsx.fileExists("./package.json") === true){
    pk = fsx.readJSONfile("./package.json");
}

var init = false;

if(pk.a7js === undefined){
    pk.a7js = {
        metadata: {
            lastUsedVersion: core.getVersion(),
            lastUsedTime: new Date()
        }
    }
    init = true;
}

//if true perform upgrade
if(ver.isNewer("4.0.0", pk.a7js.metadata.lastUsedVersion)){
    
    console.log("Updating project's a7.config.json...");
    delete core.config.devserver;
    var conf = core.config;
    delete conf.mode;
    delete conf.devserver;

    fs.writeFile("./a7.config.json", JSON.stringify(conf, null, 4), function(err){
        if(err != null){
            console.log("Configuration update was not successful");
        }
    });

    pk.a7js.metadata.lastUsedVersion = core.getVersion();
    pk.a7js.metadata.lastUsedTime = new Date();
    
    fs.writeFile("./package.json", JSON.stringify(pk, null, 4), function(err){
        if(err !== null){
            console.log("an error happened while trying to update package.json");
        }
    })

} else if (init === true){
    //TODO: make it async
    fs.writeFileSync("./package.json", JSON.stringify(pk, null, 4));
};