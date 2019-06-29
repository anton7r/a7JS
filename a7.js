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

    function $() {

        var a7 = {};

        a7.ver = "v1.2";
        a7._ = {};
        a7._.closableMenus = [];
        a7._module = {};

        //get and set modules 
        a7.module = function (module) {
            a7._module.module = module;
            this.get = a7._module.get;
            this.set = a7._module.set;
            return this;
        };
        a7._module.get = function () {
            var module = a7._module.module;
            var moduleInConf = a7.config.modules[module];
            if (moduleInConf) {
                return moduleInConf;
            } else {
                return a7.debug("The module \"" + module + "\" was not found. Please check for typos!");
            }
        };
        a7._module.set = function (newContent) {
            if (!newContent) {
                return a7.debug(".set() first param was not defined");
            }
            var moduleName = a7._module.module;
            a7.config.modules[moduleName] = newContent;
        };
        a7.renderModules = function () {
            var unRenderedModules = document.querySelectorAll("[data-a7-render-module]");
            unRenderedModules.forEach(function (module) {
                var moduleName = module.getAttribute("data-a7-render-module");
                module.innerHTML = a7.module(moduleName).get();
                module.removeAttribute("data-a7-render-module");
                module.setAttribute("data-a7-module", moduleName);
            });
        };
        a7.page = {
            _functions: {},
        };
        a7.page._functions.html = function (newHTML) {
            if (newHTML === undefined) {
                return a7.page.elem.innerHTML;
            } else {
                a7.page.elem.innerHTML = newHTML;
            }
        };
        a7.page._functions.text = function (newText) {
            if (newText === undefined) {
                return a7.page.elem.innerText;
            } else {
                a7.page.elem.innerText = newText;
            }
        };
        a7.page._functions.get = function () {
            return a7.page.elem;
        };
        a7.debug = function (message) {
            message = "%c" + "a7.js" + " " + a7.ver + ": " + message;
            return console.warn(
                message,
                "color: white; font-weight:bold;font-size:20px;"
            );
        };
        a7.host = window.location.host;

        a7.useProductionMode = function () {
            a7._.devMode = false;
        };
        a7.useHash = function(){
            a7._.useHash = true;
        };
        a7.closeMenuOnRout = function(menu){
            a7._.closeMenuOnRout = true;
            a7._.closableMenus.push(menu);
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

        a7.DOM = {};

        a7.DOM.menu = {};

        a7.toggleMenu = function (menuName) {
            var elem = a7.DOM.menu[menuName],
                classList = elem.classList,
                open = "a7-menu-" + menuName + "-open",
                closed = "a7-menu-" + menuName + "-closed";
            classList.toggle(open);
            classList.toggle(closed);
        };
        a7.closeMenu = function(menuName){
            var elem = a7.DOM.menu[menuName],
                classList = elem.classList,
                open = "a7-menu-" + menuName + "-open",
                closed = "a7-menu-" + menuName + "-closed";
            if(classList.contains(open)){
                classList.remove(open);
                classList.add(closed);
            }
        };
        a7.init = function () {
            if (a7.initDone === true) {
                return;
            }
            //use dev or production mode
            if (a7._.devMode === undefined) {
                a7._.devMode = true;
                console.log("Youre running in development mode which uses # instead of history.pushState because it is easier to make changes to your app this way. when you want to go to production mode use a7.useProductionMode() once.");
                
            }

            function initPage() {
                var Elem = document.querySelector("[data-a7-page-container]");
                if (Elem === null) {
                    return a7.debug("Page Container Could not be found, It has to have the data attribute \"data-a7-page-container\". Your website wont function without that.");
                }
                a7.pageContainer = Elem;
                Elem.setAttribute("a7-page-container", "set");
                a7.initDone = true;
            }

            initPage();

            function initMenu() {
                var elems = document.querySelectorAll("[data-a7-menu]");
                if (elems) {
                    elems.forEach(function (elem) {
                        var menuname = elem.getAttribute("data-a7-menu"),
                            state = elem.getAttribute("data-a7-default-state");
                        a7.DOM.menu[menuname] = elem;
                        if (state === "open") {
                            elem.classList.add("a7-menu-" + menuname + "-open");
                        } else if (state === "closed") {
                            elem.classList.add("a7-menu-" + menuname + "-closed");
                        } else {
                            elem.classList.add("a7-menu-" + menuname + "-closed");
                        }
                    });
                }
                var toggles = document.querySelectorAll("[data-a7-menu-toggle]");
                if (toggles) {
                    toggles.forEach(function (elem) {
                        var togglename = elem.getAttribute("data-a7-menu-toggle");
                        elem.addEventListener("mouseup", function () {
                            a7.toggleMenu(togglename);
                        });
                    });
                }
            }

            initMenu();

            function initLinks() {
                var coll = [];
                coll = document.getElementsByTagName("a");
                coll.forEach(function (link) {
                    if (link.dataset.a7link !== undefined) {
                        link.addEventListener("click", function (ev) {
                            ev.preventDefault();
                            var l = link.getAttribute("href");
                            a7.router(l);
                        });
                    } else {
                        return;
                    }
                });
            }

            initLinks();

            //inits page find feature
            function init3() {
                a7.page.find = function (elem) {
                    a7.page.elem = a7.pageContainer.querySelector(elem);
                    this.get = a7.page._functions.get;
                    this.html = a7.page._functions.html;
                    this.text = a7.page._functions.text;
                    return this;
                };
            }

            init3();

            function intiConfig() {
                if (a7.config.default_title === undefined) {
                    a7.config.default_title = document.title;
                }
                if (a7.config === undefined) {
                    a7.debug("Please configure your app check docs for help");
                }
            }

            intiConfig();

            function init4() {
                a7.router(a7.path());
                window.addEventListener("popstate", function () {
                    a7.router(a7.path());
                });
            }

            init4();
        };
        //if newPath is not defined then it will return the current path
        //Its looking too complex of a function right now.
        a7.path = function (newPath) {
            if (newPath === undefined) {
                if (a7._.devMode === false) {
                    return window.location.pathname.replace("/", "");
                } else {
                    return window.location.hash.replace("#", "");
                }
            } else {
                if (newPath.indexOf("/") === 0) {
                    newPath = newPath.replace("/", "");
                } else if (a7._.devMode === false) {
                    if (!history.pushState) {
                        window.location = newPath;
                    } else if(a7._.useHash === true){
                        window.location.hash = newPath;
                    } else {
                        history.pushState({}, undefined, ["/", newPath].join(""));
                    }
                } else {
                    window.location.hash = newPath;
                }
            }
        };
        a7._routerCache = {};
        a7._routerCache.resolvedRoutes = {};
        //Resolves any path you give
        a7.router = function (newPath) {

            if(a7._.closeMenuOnRout === true){
                a7._.closableMenus.forEach(function(menu){
                    a7.closeMenu(menu);
                });
            }

            if (newPath.indexOf("/") === 0) {
                newPath = newPath.replace("/", "");
            }

            var config = a7.config,
                index = newPath.indexOf("/"),
                mainPath = ["/", newPath.slice(0, index + 1), "*"].join(""),
                route,
                cacheMatch = a7._routerCache.resolvedRoutes[newPath],
                subPaths = newPath.split("/");

            //tries to match equal
            if (cacheMatch) {
                route = cacheMatch;
            } else if (config.routes[newPath]) {
                route = newPath;
            } else if (config.routes[mainPath]) {
                route = mainPath;
            } else if (config.routes["/*"]) {
                route = "/*";
            } else {
                return a7.debug("we could not find the page which you were looking for");
            }

            var func = config.triggers[route],
                title = config.titles[route],
                page = config.pages[config.routes[route]].trim();


            if (title) {
                document.title = title;
            } else {
                document.title = config.default_title;
            }

            if (page === a7._routerCache.latestResolvedPage) {
                //do nothing because the page is the same as the latest resolved page
            } else if (page) {
                a7.pageContainer.innerHTML = page;
                a7._routerCache.latestResolvedPage = page;
                a7._routerCache.resolvedRoutes[newPath] = route;
            }


            if (func) {
                func(subPaths);
            }

            a7.path(newPath);

            scrollTo(0, scrollX);
            //a7.pageContainer is Like a miniDOM because it displays the current page on the screen
            var links = a7.pageContainer.getElementsByTagName("a");
            if (links) {
                links.forEach(function (link) {
                    if (link.dataset.a7link) {
                        link.addEventListener("mouseup", function (ev) {
                            ev.preventDefault();
                            a7.router(link.href);
                        });
                    }
                });
            }

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