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
    var _module = {},
        useHash,
        closeMenuOnRout,
        routerCache = {},
        closableMenus = [],
        devMode,
        pageMethods = {},
        pageContainer,
        currentPageName,
        menus = {},
        initDone,
        onMenuToggleList = {};

        //debugging function which should not be public facing
        function a7debug(message) {
            message = "%c" + "a7.js" + " " + a7.ver + ": " + message;
            return console.warn(
                message,
                "color: white; font-weight:bold;font-size:20px;"
            );
        }

    function $() {
        var a7 = {};

        a7.ver = "v1.4";

        //html sanitizer
        a7.encoder = function(content){
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
        //get and set modules 
        a7.module = function (module) {
            _module.module = module;
            this.get = _module.get;
            this.set = _module.set;
            return this;
        };
        _module.get = function () {
            var module = _module.module;
            var moduleInConf = a7.config.modules[module];
            if (moduleInConf) {
                return moduleInConf;
            } else {
                return a7debug("The module \"" + module + "\" was not found. Please check for typos!");
            }
        };
        _module.set = function (newContent) {
            if (!newContent) {
                return a7debug(".set() first param was not defined");
            }
            var moduleName = _module.module;
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

        a7.useProductionMode = a7.productionMode = function () {
            devMode = false;
        };
        a7.useHash = function(){
            useHash = true;
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
        a7.renderNewLinks = function(trigger){
            var newLinks = document.querySelectorAll("[data-a7-new-link]");
            newLinks.forEach(function(link){
                link.addEventListener("click", function(ev){
                    ev.preventDefault();
                    var li = link.getAttribute(href);
                    a7.router(li);
                    link.removeAttribute("data-a7-new-link");
                    link.setAttribute("data-a7-link");
                });
            });
        };

        //Menu stuff
        a7.toggleMenu = function (menuName) {
            var elem = menus[menuName],
                classList = elem.classList,
                open = ["a7-menu-",menuName,"-open"].join(""),
                closed = ["a7-menu-",menuName,"-closed"].join(""),
                menuState;

            classList.toggle(open);
            classList.toggle(closed);

            var menuToggleFunc = onMenuToggleList[menuName];
            if (menuToggleFunc === undefined){
                return;
            }

            if (classList.contains(open) === true){
                menuState = "open";
            } else {
                menuState = "closed";
            }

            menuToggleFunc(menuState);

            return;
        };
        a7.closeMenu = function(menuName){
            var menuToggleFunc = onMenuToggleList[menuName];
            if(menuToggleFunc !== undefined){
                menuToggleFunc("closed");
            }
            var elem = menus[menuName],
                classList = elem.classList,
                open = ["a7-menu-",menuName,"-open"].join(""),
                closed = ["a7-menu-",menuName,"-closed"].join("");
            if(classList.contains(open)){
                classList.remove(open);
                classList.add(closed);
            }
            return;
        };
        a7.closeMenuOnRout = function(menu){
            closeMenuOnRout = true;
            closableMenus.push(menu);
        };
        a7.onMenuToggle = function(menuName, func){
            onMenuToggleList[menuName] = func;
        };

        //Init will run once
        a7.init = function () {
            if (initDone === true) {
                return;
            }
            //use dev or production mode
            if (devMode === undefined) {
                devMode = true;
                console.log("Youre running in development mode which uses # instead of history.pushState because it is easier to make changes to your app this way. when you want to go to production mode use a7.productionMode() once.");
                
            }

            function initPage() {
                var Elem = document.querySelector("[data-a7-page-container]");
                if (Elem === null) {
                    return a7debug("Page Container Could not be found, It has to have the data attribute \"data-a7-page-container\". Your website wont function without that.");
                }
                //assignment of pageContainer
                pageContainer = Elem;
                Elem.setAttribute("a7-page-container", "set");
                Elem.removeAttribute("data-a7-page-container");
                initDone = true;
            }

            initPage();

            function initMenu() {
                var elems = document.querySelectorAll("[data-a7-menu]");
                if (elems) {
                    elems.forEach(function (elem) {
                        var menuname = elem.getAttribute("data-a7-menu"),
                            state = elem.getAttribute("data-a7-default-state");
                        menus[menuname] = elem;
                        if (state === "open") {
                            elem.classList.add(["a7-menu-",menuname,"-open"].join(""));
                        } else if (state === "closed") {
                            elem.classList.add(["a7-menu-",menuname,"-closed"].join(""));
                        } else {
                            elem.classList.add(["a7-menu-",menuname,"-closed"].join(""));
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
                    if (link.dataset.a7link !== undefined | link.getAttribute("a7-link") !== null) {
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
                    a7.page.elem = pageContainer.querySelector(elem);
                    this.get = pageMethods.get;
                    this.html = pageMethods.html;
                    this.text = pageMethods.text;
                    return this;
                };
            }

            init3();

            function intiConfig() {
                if (a7.config.default_title === undefined) {
                    a7.config.default_title = document.title;
                }
                if (a7.config === undefined) {
                    a7debug("Please configure your app check docs for help");
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
                if (devMode === false) {
                    return window.location.pathname.replace("/", "");
                } else {
                    return window.location.hash.replace("#", "");
                }
            } else {
                if (newPath.indexOf("/") === 0) {
                    newPath = newPath.replace("/", "");
                } else if (devMode === false) {
                    if (!history.pushState) {
                        window.location = newPath;
                    } else if(useHash === true){
                        window.location.hash = newPath;
                    } else {
                        history.pushState({}, undefined, ["/", newPath].join(""));
                    }
                } else {
                    window.location.hash = newPath;
                }
            }
        };
        routerCache.resolvedRoutes = {};
        //Resolves any path you give
        a7.router = function (newPath) {

            if(closeMenuOnRout === true){
                closableMenus.forEach(function(menu){
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
                cacheMatch = routerCache.resolvedRoutes["/" + newPath],
                subPaths = newPath.split("/");

            //tries to match equal
            if (cacheMatch) {
                route = cacheMatch;
            } else if (config.routes[["/",newPath].join("")]) {
                route = ["/",newPath].join();
            } else if (config.routes[mainPath]) {
                route = mainPath;
            } else if (config.routes["/*"]) {
                route = "/*";
            } else {
                return a7debug("we could not find the page which you were looking for");
            }

            var func = config.triggers[route],
                title = config.titles[route],
                page = config.pages[config.routes[route]].trim(),
                pageName = config.routes[route];

            if (title) {
                document.title = title;
            } else {
                document.title = config.default_title;
            }

            if (page === routerCache.latestResolvedPage) {
                //do nothing because the page is the same as the latest resolved page
            } else if (page) {

                //Assign the page stuff to the view
                pageContainer.innerHTML = page;

                //classList
                pageContainer.classList.remove(["a7-page-", currentPageName].join(""));
                pageContainer.classList.add(["a7-page-", pageName].join(""));
                currentPageName = pageName;

                //store to memory the latest state for later comparison
                routerCache.latestResolvedPage = page;
                routerCache.resolvedRoutes[newPath] = route;
            }


            if (func) {
                func(subPaths);
            }

            a7.path(newPath);

            scrollTo(0, pageXOffset);

            //pageContainer is Like a miniDOM because it displays the current page on the screen
            var links = pageContainer.getElementsByTagName("a");
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