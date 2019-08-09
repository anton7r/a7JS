var app = a7.app;
var el = a7.createElement;
var resEl;

app.routes = {

    "/*": "testPage"
};

app.pages = {

    "testPage":{
        onRoute:function(){
        }
    }
};
var printRes = function(title,didPass){
    var pass;

    if (didPass === true){
        pass = "Test passed successfully!";
    } else {
        pass = "Test did not pass";
    }

    resEl.innerHTML += `  
    <div class="testRes" data-test-title="`+title+`">
    <h1>`+title+`</h1>
    <p>`+pass+`</p>
    </div>`;
};

var tester = function(name, testMe, expRes){

    if(testMe() === expRes){
        printRes(name, true);
    } else {
        printRes(name, false);
    }
};
var test = function(){
    document.getElementsByClassName("testingApp")[0].innerHTML = "<div class=\"results\"></div>";
    resEl = document.getElementsByClassName("results")[0];

    tester("a7.createElement(\"div\", \"\", \"test\")", "<div>test</div>");
};

window.onload = function(){
    document.getElementsByClassName("testingStart")[0].addEventListener("click", function(ev){
        test();
    });
};