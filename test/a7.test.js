var app = a7.app;
var el = a7.createElement;
var resEl;
var numOfTests;
var numOfTestsPassed;
var tests = {};
a7.init();
var elList = [];

app.routes = {

    "/*": "testPage"
};

app.pages = {

    "testPage":{
        onRoute:function(){
        }
    }
};
var openLog = function(logName){
    console.log(logName);

    var clog = tests[logName];
    alert("Res:" + clog.res + "\n Exp:" + clog.exp);
};

var printRes = function(title,didPass){
    var pass;

    if (didPass === true){
        pass = "Test passed successfully!";
    } else {
        pass = "Test did not pass";
    }

    resEl.innerHTML += `  
    <div class="testRes" data-test-name="` + title + `">
    <h1>` + title + `</h1>
    <p>` + pass + `</p>
    <div class="openLog" data-test-name="` + title + `">Open log</div>
    </div>`;
};

var tester = function(name, testMe, expRes){

    numOfTests++;
    var testRes = testMe();
    tests[name] = {res: testRes, exp: expRes};

    if(testRes === expRes){
        numOfTestsPassed++;
        printRes(name, true);
    } else {
        printRes(name, false);
    }
};

var getVer = function() {
    var re;

    if (a7.ver() ===undefined){
        re = "could not get version.";
    } else {
        re = a7.ver();
    }

    return re;
};

var test = function() {
    numOfTests = 0;

    numOfTestsPassed = 0;

    document.getElementsByClassName("testingApp")[0].innerHTML = "<div class=\"overview\"><h1>Test Overview</h1></div><div class=\"results\"></div>";
    resEl = document.getElementsByClassName("results")[0];
    overviewEl = document.getElementsByClassName("overview")[0];

    overviewEl.innerHTML += "<div class=\"testVersion\"><span>Tested version: </span>" + getVer() + "</div>";

    tester("a7.init()", function(){
        return a7store[10];
    }, true);

    tester("a7.createElement",function(){
        return a7.createElement("div", {}, "test");
    }, "<div>test</div>");
    
    tester("a7.createElement (Advanced)", function(){
        return a7.createElement("div", {class:"homeScreen sizeLarge"}, a7.createElement("h1", "", "Hello, Its me header1!"));
    }, "<div class=\"homeScreen sizeLarge\"><h1>Hello, Its me header1!</h1></div>");

    tester("a7store[12]", function(){
        return a7store[12];
    }, document.title);

    var i;

    for(i = 0; i < numOfTests; i++){
        elList.push(document.getElementsByClassName("openLog")[i]) ;
        console.log(element);
        var curNum = i;

        element.addEventListener("click", function(){
            var data = elList[curNum];
            openLog(data);
        });
    }
};

window.onload = function(){
    document.getElementsByClassName("testingStart")[0].addEventListener("click", function(){
        test();
    });
};