const chalk = require("chalk");

function testPassed(msg){
    console.log(chalk.black.bgGreen("Test passed"), msg)
}

function testFail(msg){
    console.log(chalk.black.bgRed("Test failed"), msg)
}

//Old code

/*
module.exports = function simpleTester(functionResult, testCase , expectedResult, testName){
    if (testCase === "==="){
        //when result should be equal
        if(functionResult === expectedResult){
            testPassed(testName);
        } else {
            testFail(testName);
        }

    } else if (testCase === "!=="){
        //when result should not be equal
        if(functionResult !== expectedResult){
            testPassed(testName);
        } else {
            testFail(testName);
        }


    } else if(testCase === undefined){
        console.log(chalk.black.bgRed("ERROR"), "test case is undefined.")
    } else {
        console.log(chalk.black.bgRed("ERROR"), "test case not supported.");
    }
}
*/

module.exports = {
    passed: 0,
    failed: 0,
    tests:[],

    addTest(test, testName){
        this.tests.push({test, testName});
    },

    runTests(testMode){
        if(testMode === undefined){
            testMode = "default";
        } else if (testMode === "silent"){
            testMode = "silent";
        } else {
            testMode = "default";
            chalk.black.bgRed("ERROR")
        }


        for(var i = 0; i < tests.length; i++){
            var test = tests[i];
        }

    }

}