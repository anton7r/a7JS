//this is our extension of node file system
const fs = require("fs");

module.exports = { 
    
    fileExists(path) {
        if(fs.existsSync(path)){
            if(fs.statSync(path).isFile()) return true
            else return false;
        } else return false;
    },

    dirExists(path) {
        if(fs.existsSync(path)) {
            if(fs.statSync(path).isDirectory()) return true;
            else return false;
        } else return false;
    },

    formatSlashes(path){
        return path.replace(/\\/g, "/");
    },

    //Removes \dir2/../ from /dir\dir2/../ to make it /dir/
    purePath(path){
        return this.formatSlashes(path).replace(/(\/\.\/|\/[^\/]*\/\.\.\/)/g, "/");
    },

    readJSONfile(path){
        var file = fs.readFileSync(path, "utf-8");
        if(file === "") return {};
        return JSON.parse(file);
    }
}
