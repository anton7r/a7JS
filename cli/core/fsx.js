//this is our extension of node file system
const fs = require("fs");

module.exports = { 
    
    fileExists(path) {
        if(fs.existsSync(path) === true){
            if(fs.statSync(path).isFile() === true){
                return true
            } else return false;
        } else return false;
    },

    dirExists(path) {
        if(fs.existsSync(path) === true) {
            if(fs.statSync(path).isDirectory() === true){
                return true;
            } else return false;
        } else return false;
    },

    formatSlashes(path){
        return path.replace(/\\/g, "/");
    },

    //Removes \dir2/../ from /dir\dir2/../ to make it /dir/
    purePath(path) {
        return this.formatSlashes(path).replace(/(\/\.\/|\/[^\/]*\/\.\.\/)/g, "/");
    },

    readJSONfile(path) {
        return JSON.parse(fs.readFileSync(path, "utf-8"));
    }
}