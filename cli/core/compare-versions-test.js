const ver = require("./compare-versions");
const tester = require("./simple-tester");

tester.addTest({
    functionResult:ver.isNewer("1.2.1", "1.0.0"), 
    testCase:"===", 
    expectedResult:true
}, "simple comparison");

tester.runTests();