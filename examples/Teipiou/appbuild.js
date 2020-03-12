newFunction();

function newFunction() {
    !function () {
    var e = document, i = function () {
    var i, t, n, o, a, r = !1; return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (r = !0), i = e => console.warn("A7JS: " + e), t = e => e.addEventListener("click", i => { i.preventDefault(), a.i(e.getAttribute("href")); }), n = (e, i) => {
    if ("number" == typeof i)
        return e; for (var t in i.t && i.t(e), i.o && e.addEventListener("click", i.o), i.s && e.addEventListener("hover", i.s), i.u && e.addEventListener("change", i.u), i.l && e.addEventListener("input", i.l), i)
            0 !== t.indexOf("a7on") && e.setAttribute(t, i[t]); return e;
    }, o = Array(12), o = [{}, {}, {}, {}, {}, {}, [], {}, !1, "", !1, ""], (a = {}).p = n => {
    o[0] = n, (() => {
    var n, r, s, c, u, l, f, p, d, g, m, h; if (!0 !== o[8]) {
        if (null === (n = e.querySelector("[a7app]")))
            return i('Page Container Could not be found, It has to have the attribute "a7app". Your website won\'t function without that.');
        if (o[7] = n, o[8] = !0, r = e.querySelectorAll("[data-a7-menu]"))
            for (s = 0; s < r.length; s++)
                u = (c = r[s]).getAttribute("data-a7-menu"), l = c.getAttribute("data-a7-default-state"), o[2][u] = c, "open" === l ? c.classList.add("a7-menu-" + u + "-open") : c.classList.add("a7-menu-" + u + "-closed");
        if (f = e.querySelectorAll("[data-a7-menu-toggle]"))
            for (p = 0; p < f.length; p++)
                f[p].addEventListener("mouseup", a.g(f[p].getAttribute("data-a7-menu-toggle")));
        for (d = e.getElementsByTagName("a"), g = 0; g < d.length; g++)
            void 0 !== d[g].dataset.m | null !== d[g].getAttribute("a7link") && t(d[g]);
        0 !== (m = e.getElementsByName("description")).length ? (o[6].push(m[0]), void 0 !== (h = m[0].getAttribute("content")) && (o[9] = h)) : (e.getElementsByTagName("head")[0].innerHTML += '<meta name="description" content="">', o[6].push(e.getElementsByName("description")[0])), o[11] = e.title, a.i(a.path()), window.addEventListener("popstate", () => a.i(a.path()));
    }
    })();
    }, a.h = e => { !0 === e || !1 === e ? o[10] = e : i("The 1st parameter (mode) only accepts booleans."), !1 === e && i("BEWARE: Props are secure by default and setting them unsecure means that your app can potentially have an xss vulnerability."); }, a.e = function (t, r) {
    var s, c, u, l, f, p, d, g, m = o[1][t]; if (0 | void 0 === r ? r = {} : r.v && (s = r.v, delete r.v), !0 === o[10])
        for (c in s)
            s[c] = a.T(s[c]); if (void 0 !== m)
            return u = m.k(s), n(u, r); for (f = n(e.createElement(t), r), p = arguments.length, l = 2; l < p; l++)
            "number" == typeof (d = arguments[l]) || "string" == typeof d && "" !== d ? (g = e.createTextNode(d), f.appendChild(g)) : d instanceof Element ? f.appendChild(d) : i("cant recognize type of " + d); return f;
    }, a.app = () => o[7], a.P = e => { !0 === r && e(); }, a.j = e => { !1 === r && e(); }, a.A = () => {
    var e = []; return this.set = i => {
    if (this.value = i, void 0 !== e)
        for (var t = 0; t < e.length; t++)
            e[t](); return i;
    }, this.addListener = i => e.push(i), this.B = e, this;
    }, a.S = function (e) {
    var i, t = o[3][e], n = o[4][e]; return void 0 === t && (t = "", o[4][e] = []), (i = {
    set(i) {
    if (o[3][e] = i, void 0 !== n)
        for (var t = 0; t < n.length; t++)
            n[t](); return i;
    }, addListener(i) { o[4][e].push(i); }
    }).B = n, i.value = t, i;
    }, a._ = i => { e.head.insertAdjacentHTML("beforeend", "<style>" + i + "</style>"); }, a.O = (e, t) => { void 0 === o[1][e] ? o[1][e] = t : i("That component is already registered!"); }, a.T = e => { var t = e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;"), n = /<script>(.|\s)+<\/script>/g; return null !== t.match(n) && (i("a script tag were fed into the sanitizer and it was blocked due to it potentially being malicious."), t.replace(n, "")), t; }, a.C = () => o[6][0], a.M = e => {
    for (var i; i < o[6].length; i++)
        o[6][i].setAttribute("content", e);
    }, a.I = i => e.title = i, a.g = function (e) { var i, t = o[2][e].classList; t.toggle("a7-menu-" + e + "-open"), t.toggle("a7-menu-" + e + "-closed"), void 0 !== (i = o[5][e]) && i(!0 === t.contains(open) ? "open" : "closed"); }, a.J = function (e) { var i, t, n, a = o[5][e]; void 0 !== a && a("closed"), t = "a7-menu-" + e + "-open", n = "a7-menu-" + e + "-closed", (i = o[2][e].classList).contains(t) ? (i.remove(t), i.add(n)) : new Error("Menu " + e + " could not be closed"); }, a.L = (e, i) => o[5][e] = i, a.path = e => {
    if (void 0 === e)
        return location.pathname.replace("/", ""); 0 !== e.indexOf("/") && (e = "/" + e), history.pushState ? history.pushState({}, void 0, e) : location = e;
    }, a.i = e => {
    var i, n, r, s, c, u, l; if (0 !== e.indexOf("/") && (e = "/" + e), n = e.slice(0, e.indexOf("/") + 1) + "*", (r = o[0])[e])
        i = e;
    else if (r[n])
        i = n;
    else {
        if (!r["q"])
            return console.error("A7JS: no specified route matched " + e);
        i = "/*";
    } if (null !== (l = (u = r[i]()).getElementsByTagName("a")))
            for (s = 0; s < l.length; s++)
                "" === l[s].getAttribute("a7link") && t(l[s]); c = u, 0 !== o[7].children.length && o[7].removeChild(o[7].lastChild), o[7].appendChild(c), a.path(e), scrollTo(0, pageXOffset);
    }, a;
    } (); i.O("page_2", { data: {}, F: {}, k: () => i.e("div", 0, i.e("h1", 0, "Teipiou Picture Gallery"), i.e("img", { src: "/img/omakuva.jpg" }), i.e("p", 0, "The Original"), i.e("img", { src: "/img/society.jpg" }), i.e("p", 0, "Society"), i.e("img", { src: "/img/all_seeing_eye.jpg" }), i.e("p", 0, "The All Seeing Eye"), i.e("img", { src: "/img/minecraft.jpg" }), i.e("p", 0, "The minecraft"), i.e("img", { src: "/img/PassTheBoof.jpg" }), i.e("p", 0, "The Pass The Boof"), i.e("img", { src: "/img/le_teipiou.jpg" }), i.e("p", 0, "Le Teipiou"), i.e("img", { src: "/img/videcheck.jpg" }), i.e("p", 0, "The Vibe Check")) }), i.p({ q: function (e) { return i.e("page_2", e); } }), i._("h1{text-align:center;font-family:Arial,Helvetica,sans-serif}p{font-size:x-large}img{height:300px}");
    } ();
}
