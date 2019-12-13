const chalk = require("chalk");

function testPassed(msg){
    console.log(chalk.black.bgGreen("Test passed"), msg)
}

function testFail(msg){
    console.log(chalk.black.bgRed("Test failed"), msg)
}

module.exports = {
    passed: 0,
    failed: 0,
    tests:[],

    addTest(name, test){
        this.tests.push({func:test, name});
    },

    runTests(testMode){
        //checks that testMode is not braking
        if(testMode === undefined){
            testMode = "default";
        } else if (testMode === "silent"){
            testMode = "silent";
        } else {
            testMode = "default";
            chalk.black.bgRed("ERROR")
        }

        //runs tests
        for(var i = 0; i < this.tests.length; i++){
            var test = this.tests[i];
            //run tests here
            if(test.func() === true){
                this.passed++;
                testPassed(test.name);
            } else {
                testFail(test.name);
                this.failed++;
            }
        }

        if(this.failed !== 0 && this.passed === 0){
            console.log("we have some bugs to fix,", this.passed+"/"+this.tests.length, "test passed");
        } else if(this.failed !== 0){
            console.log("we have some bugs to fix, only", this.passed+"/"+this.tests.length, "test passed");
        } else {
            console.log("All tests passed:", this.passed+"/"+this.tests.length);
        }
    }
}