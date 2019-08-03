//New needed features cache link hrefs!

/** 
MIT License

Copyright (c) 2019 anton7r

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function (window) {
    "use strict";
    // internal variables used in a7
    var closeMenuOnRout,
        routerCache = {},
        closableMenus = [],
        pageMethods = {},
        pageContainer,
        menus = {},
        initDone,
        onMenuToggleList = {},
        descriptionElements = [],
        default_title,
        default_desc,
        a7app = {
            routes: {},
            pages: {}
        },
        a7components = {},
        a7ver = "v3.1.3";

    //debugging function which should not be public facing
    function a7debug(message) {
        message = "%c" + "a7.js" +": " + message;
        return console.warn(
            message,
            ""
        );
    }

    function $() {
        var a7 = {};

        a7.ver = function(){
            return ["Running",a7ver].join(" ");
        };

        a7.app = a7app;

        //the letter c represents content as if c was content
        a7.createElement = function (element, attributes) {
            var finalElement;
            if (attributes === undefined | null | "null") {
                attributes = {};
            }

            if (a7components[element] !== undefined) {
                finalElement = ["<div class=\"", element, "\">", a7components[element](attributes), "</div>"].join("");
            } else {
                attributes = JSON.stringify(attributes);

                //console.log(attributes);

                var contentArray = [];
                var curVal;
                var argLen = arguments.length;

                for (curVal = 0; curVal < argLen; curVal++) {

                    var arg = arguments[curVal];

                    if (2 <= curVal) {
                        contentArray.push(arg);
                    }
                }

                var lenght = attributes.length,
                    quoteLocations = [],
                    equalLocations = [];

                for (curVal = 0; curVal < lenght; curVal++) {
                    var curChar = attributes.charAt(curVal);
                    if (curChar === "\"") {

                        quoteLocations.push(curVal);
                    } else if (curChar === ":") {

                        equalLocations.push(curVal);
                    }
                }

                //checks if ":" is inside a string 
                equalLocations.forEach(function (val) {

                    //recursive function may cause browsers not wanting to open the site
                    function checker(charPosition, str) {
                        var checkCharPos = charPosition - 1,
                            char = str.charAt(checkCharPos),
                            nextChar = str.charAt(checkCharPos - 1);

                        //console.log("checkerCharPos:", checkCharPos);

                        if (char === "\"" & nextChar === ":" | char === "\"" & nextChar === "=") {
                            //We dont want to replace this
                            //console.log(":");
                        } else if (char === "\"" & nextChar !== ":") {
                            //Replace char
                            //console.log("=");
                            attributes = a7.replaceCharAt(attributes, val, "=");
                        }
                        //fail safe for infite loops and check for the first
                        else if (checkCharPos === 0) {
                            //it appears that this is the first ":" so we want to replace it!
                            //console.log("=");
                            attributes = a7.replaceCharAt(attributes, val, "=");
                        } else {
                            checker(checkCharPos, str);
                        }
                    }
                    checker(val, attributes);
                });

                curVal = 0;
                var displacement = 0;
                quoteLocations.forEach(function (val) {
                    //console.log(curVal, attributes.charAt(val + 1 - displacement));
                    if (attributes.charAt(val + 1 - displacement) === "=") {
                        var start = quoteLocations[curVal - 1] + 1 - displacement;
                        var AttrName = attributes.slice(start, val - displacement);
                        /*
                        console.log("AttrName:",AttrName);
                        //*/
                        attributes = attributes.replace(["\"", AttrName, "\""].join(""), AttrName);
                        displacement += 2;
                    }
                    curVal++;
                });

                element = element;
                content = contentArray.join("");
                var finalAttributes = attributes.replace(/{/g, "").replace(/}/g, "").replace(/,/g, " ");


                var spacing;
                if (finalAttributes.length !== 0) {
                    spacing = " ";
                } else {
                    spacing = "";
                }
                //debugger!! comment it when it is not needed
                /*

                console.log("Content:",content);
                console.log("Attributes:", finalAttributes);
                console.log("Quotes:", quoteLocations);

                */

                finalElement = ["<", element, spacing, finalAttributes, ">", content, "</", element, ">"].join("");

            }

            return finalElement;
        };

        a7.elementCollection = function () {
            var length = arguments.length,
                i,
                res = [];
            for (i = 0; i < length; i++) {
                res.push(arguments[i]);
            }
            return res.join("");
        };

        a7.registerComponent = function (compName, compFunc) {
            if (a7components[compName] === undefined) {

                a7components[compName] = compFunc;

            } else {

                a7debug("That component is already registered!");

            }
        };
        //html sanitizer
        a7.encoder = function (content) {
            var result = content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;")
                //not a good idea TO DO THIS!!!!!!!!!!! because it is escaping and escapes can be escaped
                .replace(/\//g, "&#x2F;");
            return result;
        };

        a7.replaceCharAt = function (str, index, repWith) {
            return [str.substring(0, index), repWith, str.substring(index + 1, str.length)].join("");
        };

        a7.page = {};

        pageMethods.html = function (newHTML) {
            if (newHTML === undefined) {
                return a7.page.elem.innerHTML;
            } else {
                a7.page.elem.innerHTML = newHTML;
            }
        };
        pageMethods.text = function (newText) {
            if (newText === undefined) {
                return a7.page.elem.innerText;
            } else {
                a7.page.elem.innerText = newText;
            }
        };
        pageMethods.get = function () {
            return a7.page.elem;
        };

        a7.fallBacks = (function () {
            if (window.NodeList && !NodeList.prototype.forEach) {
                NodeList.prototype.forEach = Array.prototype.forEach;
            }

            if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
                HTMLCollection.prototype.forEach = Array.prototype.forEach;
            }
            //very useful 
            if (!"".trim) String.prototype.trim = function () {
                return this.replace(/^[\s﻿]+|[\s﻿]+$/g, '');
            };
            if (!document.querySelector) {

            }
        }());
        a7.renderNewLinks = function () {
            var newLinks = document.querySelectorAll("[data-a7-new-link]");
            newLinks.forEach(function (link) {
                link.addEventListener("click", function (ev) {
                    ev.preventDefault();
                    var li = link.getAttribute("href");
                    a7.router(li);
                    link.removeAttribute("data-a7-new-link");
                    link.setAttribute("data-a7-link", "");
                });
            });
        };

        a7.render = function () {
            var args = [],
                curVal,
                argLen = arguments.length;

            for (curVal = 0; curVal < argLen; curVal++) {
                args.push(arguments[curVal]);
            }

            pageContainer.innerHTML = args.join("\n");
        };

        a7.getDesc = function () {
            return descriptionElements[0];
        };


        a7.setDesc = function (newContent) {
            descriptionElements.forEach(function (desc) {
                desc.setAttribute("content", newContent);
            });
        };

        //Menu stuff
        a7.toggleMenu = function (menuName) {
            var elem = menus[menuName],
                classList = elem.classList,
                open = ["a7-menu-", menuName, "-open"].join(""),
                closed = ["a7-menu-", menuName, "-closed"].join(""),
                menuState;

            classList.toggle(open);
            classList.toggle(closed);

            var menuToggleFunc = onMenuToggleList[menuName];
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
            var menuToggleFunc = onMenuToggleList[menuName];
            if (menuToggleFunc !== undefined) {
                menuToggleFunc("closed");
            }
            var elem = menus[menuName],
                classList = elem.classList,
                open = ["a7-menu-", menuName, "-open"].join(""),
                closed = ["a7-menu-", menuName, "-closed"].join("");
            if (classList.contains(open)) {
                classList.remove(open);
                classList.add(closed);
            }
            return;
        };
        a7.closeMenuOnRout = function (menu) {
            closeMenuOnRout = true;
            closableMenus.push(menu);
        };
        a7.onMenuToggle = function (menuName, func) {
            onMenuToggleList[menuName] = func;
        };

        //Init will run once
        a7.init = function () {

            if (initDone === true) {
                return;
            }

            var pageContainerEL = document.querySelector("[data-a7-page-container]");
            if (pageContainerEL === null) {
                return a7debug("Page Container Could not be found, It has to have the data attribute \"data-a7-page-container\". Your website wont function without that.");
            }
            //assignment of pageContainer
            pageContainer = pageContainerEL;
            pageContainerEL.setAttribute("a7-page-container", "set");
            pageContainerEL.removeAttribute("data-a7-page-container");
            initDone = true;

            //menu init
            var menuElements = document.querySelectorAll("[data-a7-menu]");
            if (menuElements) {
                menuElements.forEach(function (elem) {
                    var menuname = elem.getAttribute("data-a7-menu"),
                        state = elem.getAttribute("data-a7-default-state");
                    menus[menuname] = elem;
                    if (state === "open") {
                        elem.classList.add(["a7-menu-", menuname, "-open"].join(""));
                    } else if (state === "closed") {
                        elem.classList.add(["a7-menu-", menuname, "-closed"].join(""));
                    } else {
                        elem.classList.add(["a7-menu-", menuname, "-closed"].join(""));
                    }
                });
            }
            var menuToggles = document.querySelectorAll("[data-a7-menu-toggle]");
            if (menuToggles) {
                menuToggles.forEach(function (elem) {
                    var togglename = elem.getAttribute("data-a7-menu-toggle");
                    elem.addEventListener("mouseup", function () {
                        a7.toggleMenu(togglename);
                    });
                });
            }

            //links init
            var linkcollection = document.getElementsByTagName("a");

            linkcollection.forEach(function (link) {
                if (link.dataset.a7link !== undefined | link.getAttribute("a7-link") !== null) {
                    link.addEventListener("click", function (ev) {
                        ev.preventDefault();
                        var l = link.getAttribute("href");
                        a7.router(l);
                    });
                }
            });

            //a7 page
            a7.page.find = function (elem) {
                a7.page.elem = pageContainer.querySelector(elem);
                this.get = pageMethods.get;
                this.html = pageMethods.html;
                this.text = pageMethods.text;
                return this;
            };

            //descriptions
            var descL = document.getElementsByName("description");

            if (descL.length !== 0) {
                descriptionElements.push(descL[0]);
                var descContent = descL[0].getAttribute("content");

                if (descContent !== undefined) {
                    default_desc = descL[0].getAttribute("content");
                }

            } else {
                document.getElementsByTagName("head")[0].innerHTML += "<meta name=\"description\" content=\"\">";
                descriptionElements.push(document.getElementsByName("description")[0]);
            }

            //conf
            default_title = document.title;

            if (a7.app === undefined) {
                return a7debug("Please configure your app check docs for help");
            }

            //first route and enabling back button
            a7.router(a7.path());

            window.addEventListener("popstate", function () {
                a7.router(a7.path());
            });
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
                    history.pushState({}, undefined, ["/", newPath].join(""));
                }

            }
        };
        routerCache.resolvedRoutes = {};
        //Resolves any path you give
        a7.router = function (newPath) {

            if (closeMenuOnRout === true) {
                closableMenus.forEach(function (menu) {
                    a7.closeMenu(menu);
                });
            }

            if (newPath.indexOf("/") === 0) {
                newPath = newPath.replace("/", "");
            }

            var app = a7.app,
                index = newPath.indexOf("/"),
                mainPath = ["/", newPath.slice(0, index + 1), "*"].join(""),
                route,
                cacheMatch = routerCache.resolvedRoutes["/" + newPath],
                subPaths = newPath.split("/");

            //tries to match equal
            if (cacheMatch) {
                route = cacheMatch;
            } else if (app.routes[["/", newPath].join("")]) {
                route = ["/", newPath].join("");
            } else if (app.routes[mainPath]) {
                route = mainPath;
            } else if (app.routes["/*"]) {
                route = "/*";
            } else {
                return a7debug("we could not find the page which you were looking for");
            }

            var title = app.pages[app.routes[route]].title,
                description = app.pages[app.routes[route]].description;

            if (title) {
                document.title = title;
            } else {
                document.title = default_title;
            }

            if (description !== undefined) {

                a7.setDesc(description);
            } else if (default_desc !== undefined) {

                a7.setDesc(default_desc);
            }
            app.pages[app.routes[route]].onRoute(subPaths);
            a7.path(newPath);
            scrollTo(0, pageXOffset);
        };

        window.onload = function () {
            a7.init();
        };
        return a7;
    }

    if (typeof a7 === "undefined") {
        window.a7 = $();
    }
})(window);