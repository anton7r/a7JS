//this is our extension of node file system
const fs = require("fs");
module.exports = { 
    fileExists(path) {
        if(fs.existsSync(path)){
            if(fs.statSync(path).isFile()) return true
            return false;
        } return false;
    },

    dirExists(path) {
        if(fs.existsSync(path)) {
            if(fs.statSync(path).isDirectory()) return true;
            return false;
        } return false;
    },

    formatSlashes(path){
        return path.replace(/\\/g, "/");
    },

    //Removes \dir2/../ from /dir\dir2/../ to make it /dir/
    purePath(path){
        return this.formatSlashes(path).replace(/(\/\.\/|\/[^\/]*\/\.\.\/)/g, "/");
    },

    folderFile(path){
        return path.replace(/(\w|\d)+\.js/i, "");
    },

    readJSONfile(path){
        var file = fs.readFileSync(path, "utf-8");
        if(file === "") return {};
        return JSON.parse(file);
    }
}
