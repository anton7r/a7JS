const ver = require("./compare-versions");
const tester = require("./simple-tester");

tester.addTest("simple", function(){
    if(ver.isNewer("1.2.2", "1.2.1") === true){
        return true
    } else return false;
});

tester.addTest("olderIsNewer", function(){
    if(ver.isNewer("1.2.2", "1.4.2") === false){
        return true;
    } else return false;
});

tester.addTest("Complex - rc", function(){
    if(ver.isNewer("2.0.0", "2.0.0-rc1.5") === true){
        return true;
    } else return false;
});

tester.runTests();