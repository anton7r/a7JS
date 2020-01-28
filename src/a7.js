/*
 *          License MIT
 *          anton7r (C) 2019
 */

var isMobile = false;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
}

//debugging function which should not be public facing
function a7debug(message) {
    console.warn("A7JS: " + message);
}

/* internal methods start */
//Init will run once
var init = function () {
    //a7store[8] is initDone
    if (a7store[8] === true) {
        return;
    }

    var pageContainerEL = document.querySelector("[a7app]");
    if (pageContainerEL === null) {
        a7debug("Page Container Could not be found, It has to have the attribute \"a7app\". Your website won't function without that.");
        return;
    }

    //assignment of a7store[7] aka pageContainer
    a7store[7] = pageContainerEL;
    a7store[8] = true;

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
        if (linkcollection[y].dataset.a7link !== undefined | linkcollection[y].getAttribute("a7link") !== null) {
            linkHandler(linkcollection[y]);
        }
    }
    //descriptions
    var descL = document.getElementsByName("description");
    if (descL.length !== 0) {
        a7store[6].push(descL[0]);
        var descContent = descL[0].getAttribute("content");
        if (descContent !== undefined) {
            a7store[9] = descContent;
        }
    } else {
        document.getElementsByTagName("head")[0].innerHTML += "<meta name=\"description\" content=\"\">";
        a7store[6].push(document.getElementsByName("description")[0]);
    }

    //conf
    a7store[11] = document.title;

    //first route and enabling back button
    a7.router(a7.path());

    window.addEventListener("popstate", function () {
        a7.router(a7.path());
    });
};

var linkHandler = function (link) {
    link.addEventListener("click", function (ev) {
        //console.log(link);
        ev.preventDefault();
        a7.router(link.getAttribute("href"));
    });
};

var eventListeners = function (elm, attributes){
    if(typeof attributes === "number"){
        //returns if there is no attributes
        return elm;
    }
    //basic event listeners

    if(attributes.a7onInit){
        attributes.a7onInit(elm);
    }

    if(attributes.a7onClick){
        elm.addEventListener("click", attributes.a7onClick);
    }

    if(attributes.a7onHover){
        elm.addEventListener("hover", attributes.a7onHover);
    }

    if(attributes.a7onChange){
        elm.addEventListener("change", attributes.a7onChange);
    }

    if(attributes.a7onInput){
        elm.addEventListener("input", attributes.a7onInput);
    }

    for (var attr in attributes){
        if(attr.indexOf("a7on") !== 0) elm.setAttribute(attr, attributes[attr]);
    }

    return elm;
};

var render = function(elem) {
    //a7store[7] is pageContainer
    if(a7store[7].children.length !== 0){
        a7store[7].removeChild(a7store[7].lastChild);
    }
    a7store[7].appendChild(elem);
};

//arrays are simply about 33% faster than objects
var a7store = Array(13);
a7store = [
    "", // Empty
    {}, //ComponentList       1
    {}, //Menus               2
    {}, //Observables         3
    {}, //Observable liste... 4
    {}, //onMenuToggleList    5
    [], //descriptionElements 6
    {}, //pageContainer       7
    false, //initDone         8
    "", //description         9
    true,//secureProps mode  10
    "", //title              11
    {}, //Routes             12
];

var a7 = {};

a7.routes = function(routes){
    a7store[12] = routes;
    init();
    return a7store[12];
};

a7.secureProps = function (mode) {
    if (mode === true || mode === false) {
        a7store[10] = mode;
    } else {
        a7debug("The 1st parameter (mode) only accepts booleans.");
    }
    if (mode === false) {
        a7debug("BEWARE: Props are secure by default and setting them unsecure means that your app can potentially have an xss vulnerability.");
    }
};

//REVIEW:
a7.createElement = function (element, attributes) {
    //Replace this
    var props;
    var component = a7store[1][element];

    if (attributes === undefined | null | "null" | 0) {
        attributes = {};
    } else if (attributes.props) {
        props = attributes.props;
        delete attributes.props;
    }

    if (a7store[10] === true) {
        //sanitize props
        var key;
        for (key in props) {
            props[key] = a7.sanitizer(props[key]);
        }
    }

    //if the element is a component
    if (component !== undefined) {
        //It's a component
        var cElement = document.createElement("div");
        cElement.className = "a7-component " + element;
        cElement.appendChild(component(props));
        cElement = eventListeners(cElement, attributes);
        return cElement;
    } else {
        //It's a regular element
        var rElement = document.createElement(element);
        rElement = eventListeners(rElement, attributes);
        
        //child elements
        var i;
        var argLen = arguments.length;

        for (i = 2; i < argLen; i++) {
            var childEl = arguments[i];
            //loops through the rest of the arguments
            if(typeof childEl === "string" && childEl !== ""){
                rElement.innerText += childEl;
            } else if (typeof childEl === "number"){
                // instance of number
                rElement.innerText += childEl;
            } else if (childEl instanceof Element){
                //instance of element
                rElement.appendChild(childEl);
            } else {
                //edge case
                a7debug("cant recognize type of "+ childEl);
            }
        }
        return rElement;
    } 
};

a7.app = function () {
    return a7store[7];
};

a7.onMobile = function(func){
    if(isMobile === true) func();
};

a7.onDesktop = function(func){
    if(isMobile === false) func();
};

a7.observable = function (){
    var listeners = [];
    
    var set = function (newValue){
        this.value = newValue;
        if(listeners !== undefined){
            for(var i = 0; i < listeners.length; i++){
                listeners[i]();
            }
        }
        return newValue;
    };
    var addListener = function (l){
        listeners.push(l);
    };
    this.set = set;
    this.addListener = addListener;
    this.listeners = listeners;
    return this;
};

a7.globalObservable = function (ObservalbeName) {
    var observable = a7store[3][ObservalbeName];
    var listeners = a7store[4][ObservalbeName];

    if(observable === undefined){
        observable = "";
        a7store[4][ObservalbeName] = [];
    }

    //methods of observable
    var __ = {};

    __.set = function(NewValue){
        a7store[3][ObservalbeName] = NewValue;
        if(listeners !== undefined){
            for(var i = 0; i < listeners.length; i++){
                listeners[i]();
            }

        }
        return NewValue;
    };

    __.addListener = function(Listener){
        a7store[4][ObservalbeName].push(Listener);

    };

    __.listeners = listeners;
    __.value = observable;
    return __;
};

a7.documentFragment = function () {
    var len = arguments.length,
        i,
        res = document.createDocumentFragment();

    for (i = 0; i < len; i++) {
        if(typeof arguments[i] === "string"){
            res.appendChild(document.createTextNode(arguments[i]));
        } else {
            res.appendChild(arguments[i]);
        }
    }
    return res;
};

//inserts css into the document head
a7.loadCSS = function(css){
    document.head.insertAdjacentHTML("beforeend", "<style>" + css + "</style>");
};

a7.registerComponent = function (name, compFunc) {
    if (a7store[1][name] === undefined) {
        a7store[1][name] = compFunc;
    } else {
        a7debug("That component is already registered!");
    }
};

//html sanitizer
a7.sanitizer = function (str) {
    var result = str
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

a7.getDesc = function () {
    return a7store[6][0];
};

a7.setDesc = function (newContent) {
    for (var i; i < a7store[6].length; i++) {
        a7store[6][i].setAttribute("content", newContent);
    }
};

a7.setTitle = function (title) {
    document.title = title;
};

//Menu stuff

//REVIEW: combine toggleMenu and closeMenu
//make a forceState parameter into toggle menu.
//since toggleMenu and closeMenu is basicly the same.
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
    //FIXME: BUG HERE
    if (classList.contains(open) === true) {
        menuState = "open";
    } else {
        menuState = "closed";
    }

    menuToggleFunc(menuState);
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

a7.onMenuToggle = function (menuName, func) {
    a7store[5][menuName] = func;
};

//if newPath is not defined then it will return the current path
a7.path = function (path) {
    if (path === undefined) {
        return window.location.pathname.replace("/", "");
    } else {
        if (path.indexOf("/") !== 0) {
            path = "/"+path;
        }
        if (!history.pushState) {
            window.location = path;
        } else {
            history.pushState({}, undefined, path);
        }
    }
};

//Resolves any path you give
a7.router = function (newPath) {
    if (newPath.indexOf("/") !== 0) {
        newPath = "/"+newPath;
    }
    //cacheMath no longer most likely does anything
    var mainPath = newPath.slice(0, newPath.indexOf("/") + 1) + "*",
    route,
    routes = a7store[12];
    //tries to match equal
    if (routes[newPath]){
        route = newPath;
    } else if (routes[mainPath]) {
        route = mainPath;
    } else if (routes["/*"]) {
        route = "/*";
    } else {
        return console.error("A7JS: no specified route matched "+newPath);
    }

    var renderable = routes[route](),
    i,
    links = renderable.getElementsByTagName("a");
    
    if(links !== null){
        for (i = 0; i < links.length; i++) {
            if(links[i].getAttribute("a7link") === ""){
                linkHandler(links[i]);
            }
        }
    }

    render(renderable);
    a7.path(newPath);
    scrollTo(0, pageXOffset);
};

module.exports = a7;