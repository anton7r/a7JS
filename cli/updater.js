//updater script has to run everytime since we cannot know if the project is old or not
const fs = require("fs");
const fsx = require("./core/fsx.js");
const core = require("./core/core");
const ver = require("./core/compare-versions");

/*
if(core.config.devserver !== undefined){
    delete core.config.devserver;
}

fs.writeFile("./a7.config.json", JSON.stringify(core.config, null, 4), err => {
    if (err !== null){
        core.errorLog("We have ran into a problem while trying to upgrade your configuration file");
    }
});

*/
//file name
//module.path;

//needs to check wether directory has a7 config file
if (fsx.fileExists("./a7.config.json")) {

    var dataFolder = fsx.purePath(module.path + "/../data");

    if (fsx.dirExists(dataFolder) === false) {
        fs.mkdirSync(dataFolder);
    }

    dataFile = dataFolder + "/project.data.json";

    if (fsx.fileExists(dataFile) === false) {
        fs.writeFileSync(dataFile, "{}");
    }

    var projectData = fsx.readJSONfile(dataFile);

    var projectFolder = fsx.formatSlashes(process.cwd());
    if (projectData[projectFolder] === undefined) {
        projectData[projectFolder] = {};
    }

    if (projectData[projectFolder].onVersion === undefined) {
        projectData[projectFolder].onVersion = core.getVersion();
    }

    if (projectData[projectFolder].opened === undefined) {
        projectData[projectFolder].opened = new Date();
    }

    fs.writeFileSync(dataFile, JSON.stringify(projectData));
}