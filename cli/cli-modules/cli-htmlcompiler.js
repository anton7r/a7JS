function getElTag(el){
    el = el.replace(/((\s.+)+?|\>|\/|\<)/g, "");

    return el;
}

module.exports = function(html){
console.log(html);
var htmlCopy1 = html;
var htmlCopy2 = html;
var htmlCopy3 = html;

var compiledStringifiedArray = "";

var headElements = [];

var ElementStarting = html.match(/\<[^<>/\s]+\s*[^<>]*?(?<=[^/])\>/g);

var ElementClosing = html.match(/\<\/(\w|\d)+?\>/g);

var ElementSelfClosing = html.match(/\<(\d|\w)+?(|\s|[^>]*?)\s*?\/\>/g);

console.log(ElementStarting);
console.log(ElementClosing);

var indexOF = {};
indexOF.ElementStarting = [];
indexOF.ElementClosing = [];
indexOF.ElementSelfClosing = [];

var lastIndexOF = {};
lastIndexOF.ElementStarting = [];
lastIndexOF.ElementClosing = [];
lastIndexOF.ElementSelfClosing = [];

var tagOF = {};
tagOF.ElementStarting = [];
tagOF.ElementClosing = [];
tagOF.ElementSelfClosing = [];

var Jump = 0;

if(ElementStarting !== null&& ElementStarting !== undefined){
    ElementStarting.forEach(val => {
        var index = htmlCopy1.indexOf(val) + Jump;
        var lIndex = htmlCopy1.lastIndexOf(val) + Jump;
        htmlCopy1 = htmlCopy1.replace(val, "");
        Jump += val.length;
        indexOF.ElementStarting.push(index);
        lastIndexOF.ElementStarting.push(lIndex);
        tagOF.ElementStarting.push(getElTag(val));
    });
}

Jump = 0;
if(ElementClosing !== null&& ElementClosing !== undefined){
    ElementClosing.forEach(val => {
        var index = htmlCopy2.indexOf(val) + Jump;
        var lIndex = htmlCopy2.lastIndexOf(val) + Jump;
        htmlCopy2 = htmlCopy2.replace(val, "");

        Jump += val.length;
        tagOF.ElementClosing.push(getElTag(val));
        indexOF.ElementClosing.push(index);
        lastIndexOF.ElementClosing.push(lIndex);
    });
}

Jump = 0;
if(ElementSelfClosing !== null&& ElementSelfClosing !== undefined){
    ElementSelfClosing.forEach(val => {
        var index = htmlCopy3.indexOf(val) + Jump;
        var lIndex = htmlCopy3.lastIndexOf(val) + Jump;
        htmlCopy3 = htmlCopy3.replace(val, "");

        Jump += val.length;
        indexOF.ElementSelfClosing.push(index);
        tagOF.ElementSelfClosing.push(getElTag(val));
        lastIndexOF.ElementSelfClosing.push(lIndex);
    });
}

console.log(tagOF.ElementStarting);
console.log(tagOF.ElementClosing);
console.log(lastIndexOF.ElementStarting);
console.log(lastIndexOF.ElementClosing);
//console.log(ElementStarting);
//console.log(ElementSelfClosing);
//console.log(ElementClosing);


//building algo
//Get topLevel Elements first
var loc = 0; 
ElementStarting.forEach(function(val){
    //findClosing
    var nextStart = indexOF.ElementStarting[loc + 1];
    var close = indexOF.ElementClosing[loc];
    var content = "";
    var el;
    //safe close
    if(nextStart > close | nextStart === undefined){
        content = html.slice(indexOF.ElementStarting[loc] + val.length, indexOF.ElementClosing[loc]);
        el = "a7.createElement(\'"+tagOF.ElementStarting[loc]+"\',{},\'"+content+"\')";    
        headElements.push(el);
    }
    
    


    loc++;
});

if(headElements !== null&& headElements !== undefined){
    headElements.forEach(function(el){
        compiledStringifiedArray += el + ",";
    });
}

var compiled = "a7.documentFragment("+ compiledStringifiedArray + ")";

console.log(compiled);
return compiled;

};