/*
 *          License MIT
 *          anton7r (C) 2019
 */
/* internal methods start */
//Init will run once
var init = function () {
    //a7store[10] is initDone
    if (a7store[10] === true) {
        return;
    }

    var pageContainerEL = document.querySelector("[data-a7-page-container]");
    if (pageContainerEL === null | pageContainerEL === undefined) {
        return a7debug("Page Container Could not be found, It has to have the data attribute \"data-a7-page-container\". Your website wont function without that.");
    }
    //assignment of a7store[9] aka pageContainer
    a7store[9] = pageContainerEL;
    pageContainerEL.setAttribute("a7-page-container", "set");
    pageContainerEL.removeAttribute("data-a7-page-container");
    a7store[10] = true;

    //menu init
    var menuElements = document.querySelectorAll("[data-a7-menu]");
    if (menuElements) {
        for (var i = 0; i < menuElements.length; i++) {
            var elem = menuElements[i],
                menuname = elem.getAttribute("data-a7-menu"),
                state = elem.getAttribute("data-a7-default-state");
            a7store[2][menuname] = elem;
            if (state === "open") {
                elem.classList.add("a7-menu-" + menuname + "-open");
            } else if (state === "closed") {
                elem.classList.add("a7-menu-" + menuname + "-closed");
            } else {
                elem.classList.add("a7-menu-" + menuname + "-closed");
            }
        }
    }

    var menuToggles = document.querySelectorAll("[data-a7-menu-toggle]");
    if (menuToggles) {
        for (var x = 0; x < menuToggles.length; x++) {
            menuToggles[x].addEventListener("mouseup",
                a7.toggleMenu(menuToggles[x].getAttribute("data-a7-menu-toggle"))
            );
        }
    }

    //links init
    var linkcollection = document.getElementsByTagName("a");

    for (var y = 0; y < linkcollection.length; y++) {
        if (linkcollection[y].dataset.a7link !== undefined | linkcollection[y].getAttribute("a7-link") !== null) {
            a7.linkHandler(linkcollection[y]);
        }
    }

    //descriptions
    var descL = document.getElementsByName("description");

    if (descL.length !== 0) {
        a7store[6].push(descL[0]);
        var descContent = descL[0].getAttribute("content");

        if (descContent !== undefined) {
            a7store[11] = descContent;
        }

    } else {
        document.getElementsByTagName("head")[0].innerHTML += "<meta name=\"description\" content=\"\">";
        a7store[6].push(document.getElementsByName("description")[0]);
    }

    //conf
    a7store[12] = document.title;

    //first route and enabling back button
    a7.router(a7.path());

    window.addEventListener("popstate", function () {
        a7.router(a7.path());
    });
};

var render = function () {
    var final = "",
        curVal,
        argLen = arguments.length;

    for (curVal = 0; curVal < argLen; curVal++) {
        final += arguments[curVal];
    }

    if (final.search("onclick=\"") !== -1 | final.search("onerror=\"") !== -1 | final.search("onload=\"") !== -1 | final.search("onhover=\"") !== -1) {
        return a7debug("a possible security vulnerability found in your application, ERROR: on[event] attributes deprecated.");
    }

    //a7store[9] is pageContainer
    a7store[9].innerHTML = final;
};

var objectToAttributes = function (obj) {
    obj = JSON.stringify(obj);
    var lenght = obj.length,
        quoteLocations = [],
        equalLocations = [],
        curVal;
    for (curVal = 0; curVal < lenght; curVal++) {
        var curChar = obj.charAt(curVal);
        if (curChar === "\"") {

            quoteLocations.push(curVal);
        } else if (curChar === ":") {

            equalLocations.push(curVal);
        }
    }

    //checks if ":" is inside a string
    var eqLen = equalLocations.length;

    for (curVal = 0; curVal < eqLen; curVal++) {
        var resolv = true,
            charPosition = equalLocations[curVal],
            char = obj.charAt(charPosition - 1),
            nextChar = obj.charAt(charPosition - 2);
        while (resolv) {
            //console.log("checkerCharPos:", charPosition - 1);

            if (char === "\"" & nextChar === ":" | char === "\"" & nextChar === "=") {
                //We dont want to replace this
                //console.log(":");
                resolv = false;
            } else if (char === "\"" & nextChar !== ":") {
                //Replace char
                //console.log("=");
                obj = a7.replaceCharAt(obj, charPosition, "=");
                resolv = false;
            }
            //fail safe for infite loops and check for the first
            else if (charPosition === 1) {
                //it appears that this is the first ":" so we want to replace it!
                //console.log("=");
                obj = a7.replaceCharAt(obj, charPosition, "=");
                resolv = false;
            } else {
                charPosition -= 1;
            }
        }
    }

    var displacement = 0,
        quLen = quoteLocations.length;
    for (curVal = 0; curVal < quLen; curVal++) {
        var val = quoteLocations[curVal];
        //console.log(curVal, obj.charAt(val + 1 - displacement));
        if (obj.charAt(val + 1 - displacement) === "=") {
            var start = quoteLocations[curVal - 1] + 1 - displacement;
            var AttrName = obj.slice(start, val - displacement);
            /*
            console.log("AttrName:",AttrName);
            //*/
            obj = obj.replace("\"" + AttrName + "\"", AttrName);
            displacement += 2;
        }
    }

    obj = obj.replace(/({|})/g, "").replace(/,/g, " ");
    //console.log(finalAttributes);

    if (obj === "\"\"") {
        obj = "";
    }

    return obj;
};

//very useful 
if (!"".trim) String.prototype.trim = function () {
    return this.replace(/^[\s﻿]+|[\s﻿]+$/g, '');
};

//debugging function which should not be public facing
function a7debug(message) {
    message = "%c" + "a7.js: " + message;
    return console.warn(
        message,
        ""
    );
}

//we changed a7store object to an array because we tested that arrays are simply about 33% faster than objects
//which would give us a huge performance increase
var a7store = Array(16);
a7store = [
    "v4-pre", //Version       0
    {}, //ComponentList       1
    {}, //Menus               2
    [], //ClosableMenus       3
    {}, //PageMethods         4
    {}, //onMenuToggleList    5
    [], //descriptionElements 6
    {}, //cacheMatch          7
    false, //closeMenuOnRout  8
    {}, //pageContainer       9
    false, //initDone         10
    "", //description         11
    "", //title               12
    true, //secureProps mode  13
    {}, //Routes              14
    [], //eventListenerQueue  15
];

/* internal methods end */

/* outfacing api start */
var a7 = {};

a7.ver = function () {
    return a7store[0];
};

a7.routes = function(routes){
    a7store[14] = routes;
    init();
    return a7store[14];
};

a7.secureProps = function (mode) {
    if (mode === true || mode === false) {
        a7store[13] = mode;
    } else {
        a7debug("The parameter 1 (mode) only accepts booleans.");
    }

    if (mode === false) {
        a7debug("BEWARE: Props are secure by default and setting them unsecure means that your app can potentially have an xss vulnerability.");
    }
};

a7.createElement = function (element, attributes) {
    var finalElement,
        props;

    if (attributes === undefined | null | "null") {
        attributes = "";
    } else if (attributes.props) {
        props = attributes.props;
        delete attributes.props;
    }
    var component = a7store[1][element];
    var elclass = attributes.class;

    if(component !== undefined){

        if(elclass === undefined){
            elclass = "";
        } else {
            elclass = " " + elclass;
            delete attributes.class;
        }

    }

    attributes = objectToAttributes(attributes);
    
    if(attributes !== ""){
        attributes = " " + attributes;
    }

    //If secure mode is enabled
    if (a7store[13] === true) {
        //sanitize props
        var key;
        for (key in props) {
            props[key] = a7.sanitizer(props[key]);
        }
    }

    //if the element is a component
    if (component !== undefined) {

        finalElement = "<div class=\"a7-component " + element + elclass + "\"" + attributes + ">" + component(props) + "</div>";

    } else {

        //console.log(attributes);
        //Join content
        var contentArray = [];
        var curVal;
        var argLen = arguments.length;

        for (curVal = 2; curVal < argLen; curVal++) {
            contentArray.push(arguments[curVal]);
        }

        content = contentArray.join("");
        //debugger!! comment it when it is not needed
        /*
        console.log("Content:",content);
        */
        finalElement = "<" + element + " " + attributes + ">" + content + "</" + element + ">";
    }

    return finalElement;
};

a7.elementCollection = function () {
    var length = arguments.length,
        i,
        result = "";
    for (i = 0; i < length; i++) {
        result += arguments[i];
    }
    return result;
};

a7.loadCSS = function(css){
    document.head.insertAdjacentHTML("beforeend", "<style>" + css + "</style>");
};

a7.EventListener = function(target, event, handler){
    a7store[15].push({
        target:target,
        event:event,
        handler:handler
    });
};

a7.registerComponent = function (compName, compFunc) {
    if (compName === "div" | compName === "p" | compName === "span" | compName === "h1") {
        return a7debug("please choose a different Component name because the name " + compName + " is a htmltag name.");
    } else if (a7store[1][compName] === undefined) {
        a7store[1][compName] = compFunc;
    } else {
        a7debug("That component is already registered!");
    }
};

//html sanitizer
a7.sanitizer = function (content) {
    var result = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");

    //finds typical xss vectors
    var findScript = /<script>(.|\s)+<\/script>/g;
    if (result.match(findScript) !== null) {
        a7debug("a script tag were fed into the sanitizer and it was blocked due to it potentially being malicious.");
        result.replace(findScript, "");
    }

    return result;
};

a7.replaceCharAt = function (str, index, repWith) {
    return str.substring(0, index) + repWith + str.substring(index + 1, str.length);
};

a7.linkHandler = function (link) {
    link.addEventListener("click", function (ev) {
        //console.log(link);
        ev.preventDefault();
        a7.router(link.getAttribute("href"));
    });
};

a7.renderNewLinks = function () {
    var newLinks = document.querySelectorAll("[data-a7-new-link]"),
        i;
    for (i = 0; i < newLinks.length; i++) {
        a7.linkHandler(newLinks[i]);
        newLinks[i].removeAttribute("data-a7-new-link");
        newLinks[i].setAttribute("data-a7-link", "");
    }
};

a7.getDesc = function () {
    return a7store[6][0];
};

a7.setDesc = function (newContent) {
    for (var i; i < a7store[6].length; i++) {
        a7store[6][i].setAttribute("content", newContent);
    }
};

a7.setTitle = function (newTitle) {
    document.title = newTitle;
};

//Menu stuff
a7.toggleMenu = function (menuName) {
    var elem = a7store[2][menuName],
        classList = elem.classList,
        menuState;

    classList.toggle("a7-menu-" + menuName + "-open");
    classList.toggle("a7-menu-" + menuName + "-closed");

    var menuToggleFunc = a7store[5][menuName];
    if (menuToggleFunc === undefined) {
        return;
    }

    if (classList.contains(open) === true) {
        menuState = "open";
    } else {
        menuState = "closed";
    }

    menuToggleFunc(menuState);

    return;
};

a7.closeMenu = function (menuName) {
    var menuToggleFunc = a7store[5][menuName];
    if (menuToggleFunc !== undefined) {
        menuToggleFunc("closed");
    }
    var elem = a7store[2][menuName],
        classList = elem.classList,
        open = "a7-menu-" + menuName + "-open",
        closed = "a7-menu-" + menuName + "-closed";
    if (classList.contains(open)) {
        classList.remove(open);
        classList.add(closed);
    } else {
        new Error("Menu " + menuName + " could not be closed");
    }
};

a7.closeMenuOnRout = function (menu) {
    if (menu === undefined) {
        new Error("Menu" + menu + "could not be found.");
    } else {
        a7store[8] = true;
        a7store[3].push(menu);
    }
};

a7.onMenuToggle = function (menuName, func) {
    a7store[5][menuName] = func;
};

//if newPath is not defined then it will return the current path
//Its looking too complex of a function right now.
a7.path = function (newPath) {
    if (newPath === undefined) {
        return window.location.pathname.replace("/", "");
    } else {
        if (newPath.indexOf("/") === 0) {
            newPath = newPath.replace("/", "");
        }
        if (!history.pushState) {
            window.location = newPath;
        } else {
            history.pushState({}, undefined, "/" + newPath);
        }
    }
};

//Resolves any path you give
a7.router = function (newPath) {

    if (a7store[8] === true) {
        for (var i; i < a7store[3].length; i++) {
            a7.closeMenu(a7store[3][i]);
        }
    }

    if (newPath.indexOf("/") === 0) {
        newPath = newPath.replace("/", "");
    }

    var mainPath = "/" + newPath.slice(0, newPath.indexOf("/") + 1) + "*",
        route,
        routes = a7store[14],
        cacheMatch = a7store[7]["/" + newPath];

    //tries to match equal
    if (cacheMatch) {
        route = cacheMatch;
    } else if (routes["/" + newPath]) {
        route = "/" + newPath;
    } else if (routes[mainPath]) {
        route = mainPath;
    } else if (routes["/*"]) {
        route = "/*";
    } else {
        return a7debug("we could not find the page which you were looking for");
    }

    render(routes[route]());

    var eventListenerQueue = a7store[15];
    var evListenerLen = eventListenerQueue.length;
    var y = 0;

    for(y = 0; y<evListenerLen; y++){
        var obj = eventListenerQueue[y];
        obj.target.addEventListener(obj.event, obj.handler);
    }

    a7store[15] = [];
    a7.path(newPath);
    scrollTo(0, pageXOffset);
};
/* outfacing api end */


module.exports = a7;