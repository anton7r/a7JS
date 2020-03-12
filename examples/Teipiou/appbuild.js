! function () {
    var e = function () {
        var e = !1;
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (e = !0);
        var t = e => console.warn("A7JS: " + e),
            n = e => e.addEventListener("click", t => {
                t.preventDefault(), r.t(e.getAttribute("href"))
            }),
            i = (e, t) => {
                if ("number" == typeof t) return e;
                for (var n in t.i && t.i(e), t.o && e.addEventListener("click", t.o), t.u && e.addEventListener("hover", t.u), t.s && e.addEventListener("change", t.s), t.l && e.addEventListener("input", t.l), t) 0 !== n.indexOf("a7on") && e.setAttribute(n, t[n]);
                return e
            },
            o = Array(12);
        o = [{}, {}, {}, {}, {}, {},
            [], {}, !1, "", !1, ""
        ];
        var r = {
            p: e => {
                o[0] = e, (() => {
                    if (!0 !== o[8]) {
                        var e = document.querySelector("[a7app]");
                        if (null === e) return t('Page Container Could not be found, It has to have the attribute "a7app". Your website won\'t function without that.');
                        o[7] = e, o[8] = !0;
                        var i = document.querySelectorAll("[data-a7-menu]");
                        if (i)
                            for (var a = 0; a < i.length; a++) {
                                var c = i[a],
                                    u = c.getAttribute("data-a7-menu"),
                                    s = c.getAttribute("data-a7-default-state");
                                o[2][u] = c, "open" === s ? c.classList.add("a7-menu-" + u + "-open") : c.classList.add("a7-menu-" + u + "-closed")
                            }
                        var d = document.querySelectorAll("[data-a7-menu-toggle]");
                        if (d)
                            for (var l = 0; l < d.length; l++) d[l].addEventListener("mouseup", r.m(d[l].getAttribute("data-a7-menu-toggle")));
                        for (var p = document.getElementsByTagName("a"), f = 0; f < p.length; f++) void 0 !== p[f].dataset.v | null !== p[f].getAttribute("a7link") && n(p[f]);
                        var m = document.getElementsByName("description");
                        if (0 !== m.length) {
                            o[6].push(m[0]);
                            var v = m[0].getAttribute("content");
                            void 0 !== v && (o[9] = v)
                        } else document.getElementsByTagName("head")[0].innerHTML += '<meta name="description" content="">', o[6].push(document.getElementsByName("description")[0]);
                        o[11] = document.title, r.t(r.path()), window.addEventListener("popstate", () => r.t(r.path()))
                    }
                })()
            },
            g: e => {
                !0 === e || !1 === e ? o[10] = e : t("The 1st parameter (mode) only accepts booleans."), !1 === e && t("BEWARE: Props are secure by default and setting them unsecure means that your app can potentially have an xss vulnerability.")
            },
            e: function (e, n) {
                var a, c = o[1][e];
                if (0 | void 0 === n ? n = {} : n.h && (a = n.h, delete n.h), !0 === o[10])
                    for (var u in a) a[u] = r.T(a[u]);
                if (void 0 !== c) {
                    var s = c.k(a);
                    return i(s, n)
                }
                var d, l = i(document.createElement(e), n),
                    p = arguments.length;
                for (d = 2; d < p; d++) {
                    var f = arguments[d];
                    if ("number" == typeof f || "string" == typeof f && "" !== f) {
                        var m = document.createTextNode(f);
                        l.appendChild(m)
                    } else f instanceof Element ? l.appendChild(f) : t("cant recognize type of " + f)
                }
                return l
            },
            app: () => o[7],
            P: t => {
                !0 === e && t()
            },
            j: t => {
                !1 === e && t()
            }
        };
        return r.A = () => {
            var e = [];
            return this.set = t => {
                if (this.value = t, void 0 !== e)
                    for (var n = 0; n < e.length; n++) e[n]();
                return t
            }, this.addListener = t => e.push(t), this.B = e, this
        }, r.S = function (e) {
            var t = o[3][e],
                n = o[4][e];
            void 0 === t && (t = "", o[4][e] = []);
            var i = {
                set: function (t) {
                    if (o[3][e] = t, void 0 !== n)
                        for (var i = 0; i < n.length; i++) n[i]();
                    return t
                },
                addListener: function (t) {
                    o[4][e].push(t)
                }
            };
            return i.B = n, i.value = t, i
        }, r._ = e => {
            document.head.insertAdjacentHTML("beforeend", "<style>" + e + "</style>")
        }, r.M = (e, n) => {
            void 0 === o[1][e] ? o[1][e] = n : t("That component is already registered!")
        }, r.T = e => {
            var n = e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;"),
                i = /<script>(.|\s)+<\/script>/g;
            return null !== n.match(i) && (t("a script tag were fed into the sanitizer and it was blocked due to it potentially being malicious."), n.replace(i, "")), n
        }, r.O = () => o[6][0], r.C = e => {
            for (var t; t < o[6].length; t++) o[6][t].setAttribute("content", e)
        }, r.I = e => document.title = e, r.m = function (e) {
            var t = o[2][e].classList;
            t.toggle("a7-menu-" + e + "-open"), t.toggle("a7-menu-" + e + "-closed");
            var n = o[5][e];
            void 0 !== n && n(!0 === t.contains(open) ? "open" : "closed")
        }, r.J = function (e) {
            var t = o[5][e];
            void 0 !== t && t("closed");
            var n = o[2][e].classList,
                i = "a7-menu-" + e + "-open",
                r = "a7-menu-" + e + "-closed";
            n.contains(i) ? (n.remove(i), n.add(r)) : new Error("Menu " + e + " could not be closed")
        }, r.L = (e, t) => o[5][e] = t, r.path = e => {
            if (void 0 === e) return location.pathname.replace("/", "");
            0 !== e.indexOf("/") && (e = "/" + e), history.pushState ? history.pushState({}, void 0, e) : location = e
        }, r.t = e => {
            0 !== e.indexOf("/") && (e = "/" + e);
            var t, i = e.slice(0, e.indexOf("/") + 1) + "*",
                a = o[0];
            if (a[e]) t = e;
            else if (a[i]) t = i;
            else {
                if (!a["q"]) return console.error("A7JS: no specified route matched " + e);
                t = "/*"
            }
            var c, u, s = a[t](),
                d = s.getElementsByTagName("a");
            if (null !== d)
                for (c = 0; c < d.length; c++) "" === d[c].getAttribute("a7link") && n(d[c]);
            u = s, 0 !== o[7].children.length && o[7].removeChild(o[7].lastChild), o[7].appendChild(u), r.path(e), scrollTo(0, pageXOffset)
        }, r
    }();
    e.M("page_2", {
        data: {},
        D: {},
        k: () => e.e("div", 0, e.e("h1", 0, "Teipiou Picture Gallery"), e.e("img", {
            src: "/img/omakuva.jpg"
        }), e.e("p", 0, "The Original"), e.e("img", {
            src: "/img/society.jpg"
        }), e.e("p", 0, "Society"), e.e("img", {
            src: "/img/all_seeing_eye.jpg"
        }), e.e("p", 0, "The All Seeing Eye"), e.e("img", {
            src: "/img/minecraft.jpg"
        }), e.e("p", 0, "The minecraft"), e.e("img", {
            src: "/img/PassTheBoof.jpg"
        }), e.e("p", 0, "The Pass The Boof"), e.e("img", {
            src: "/img/le_teipiou.jpg"
        }), e.e("p", 0, "Le Teipiou"), e.e("img", {
            src: "/img/videcheck.jpg"
        }), e.e("p", 0, "The Vibe Check"))
    }), e.p({
        q: function (t) {
            return e.e("page_2", t)
        }
    }), e._("h1{text-align:center;font-family:Arial,Helvetica,sans-serif}p{font-size:x-large}img{height:300px}")
}();