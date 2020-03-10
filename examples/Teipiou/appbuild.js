!(function() {
  var e = (function() {
    var e = !1;
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) && (e = !0);
    var n = e => console.warn("A7JS: " + e),
      t = e =>
        e.addEventListener("click", n => {
          n.preventDefault(), r.t(e.getAttribute("href"));
        }),
      o = (e, n) => {
        if ("number" == typeof n) return e;
        for (var t in (n.o && n.o(e),
        n.i && e.addEventListener("click", n.i),
        n.u && e.addEventListener("hover", n.u),
        n.s && e.addEventListener("change", n.s),
        n.l && e.addEventListener("input", n.l),
        n))
          0 !== t.indexOf("a7on") && e.setAttribute(t, n[t]);
        return e;
      },
      i = Array(12);
    i = [{}, {}, {}, {}, {}, {}, [], {}, !1, "", !1, ""];
    var r = {
      p: e => (
        (i[0] = e),
        (() => {
          if (!0 !== i[8]) {
            var e = document.querySelector("[a7app]");
            if (null === e)
              return n(
                'Page Container Could not be found, It has to have the attribute "a7app". Your website won\'t function without that.'
              );
            (i[7] = e), (i[8] = !0);
            var o = document.querySelectorAll("[data-a7-menu]");
            if (o)
              for (var a = 0; a < o.length; a++) {
                var u = o[a],
                  c = u.getAttribute("data-a7-menu"),
                  s = u.getAttribute("data-a7-default-state");
                (i[2][c] = u),
                  "open" === s
                    ? u.classList.add("a7-menu-" + c + "-open")
                    : u.classList.add("a7-menu-" + c + "-closed");
              }
            var d = document.querySelectorAll("[data-a7-menu-toggle]");
            if (d)
              for (var f = 0; f < d.length; f++)
                d[f].addEventListener(
                  "mouseup",
                  r.m(d[f].getAttribute("data-a7-menu-toggle"))
                );
            for (
              var l = document.getElementsByTagName("a"), p = 0;
              p < l.length;
              p++
            )
              (void 0 !== l[p].dataset.v) |
                (null !== l[p].getAttribute("a7link")) && t(l[p]);
            var m = document.getElementsByName("description");
            if (0 !== m.length) {
              i[6].push(m[0]);
              var v = m[0].getAttribute("content");
              void 0 !== v && (i[9] = v);
            } else
              (document.getElementsByTagName("head")[0].innerHTML +=
                '<meta name="description" content="">'),
                i[6].push(document.getElementsByName("description")[0]);
            (i[11] = document.title),
              r.t(r.path()),
              window.addEventListener("popstate", () => r.t(r.path()));
          }
        })(),
        i[0]
      ),
      g: e => {
        !0 === e || !1 === e
          ? (i[10] = e)
          : n("The 1st parameter (mode) only accepts booleans."),
          !1 === e &&
            n(
              "BEWARE: Props are secure by default and setting them unsecure means that your app can potentially have an xss vulnerability."
            );
      },
      e: function(e, t) {
        var a,
          u = i[1][e];
        if (
          (0 | (void 0 === t) ? (t = {}) : t.h && ((a = t.h), delete t.h),
          !0 === i[10])
        )
          for (var c in a) a[c] = r.T(a[c]);
        if (void 0 !== u) {
          var s = document.createElement("div");
          return (
            (s.className = "a7-component " + e), s.appendChild(u.k(a)), o(s, t)
          );
        }
        var d,
          f = o(document.createElement(e), t),
          l = arguments.length;
        for (d = 2; d < l; d++) {
          var p = arguments[d];
          if ("number" == typeof p || ("string" == typeof p && "" !== p)) {
            var m = document.createTextNode(p);
            f.appendChild(m);
          } else
            p instanceof Element
              ? f.appendChild(p)
              : n("cant recognize type of " + p);
        }
        return f;
      },
      app: () => i[7],
      P: function(n) {
        !0 === e && n();
      },
      j: function(n) {
        !1 === e && n();
      }
    };
    return (
      (r.A = () => {
        var e = [];
        return (
          (this.set = n => {
            if (((this.value = n), void 0 !== e))
              for (var t = 0; t < e.length; t++) e[t]();
            return n;
          }),
          (this.addListener = n => e.push(n)),
          (this.B = e),
          this
        );
      }),
      (r.S = function(e) {
        var n = i[3][e],
          t = i[4][e];
        void 0 === n && ((n = ""), (i[4][e] = []));
        var o = {
          set: function(n) {
            if (((i[3][e] = n), void 0 !== t))
              for (var o = 0; o < t.length; o++) t[o]();
            return n;
          },
          addListener: function(n) {
            i[4][e].push(n);
          }
        };
        return (o.B = t), (o.value = n), o;
      }),
      (r._ = function() {
        var e,
          n = arguments.length,
          t = document.createDocumentFragment();
        for (e = 0; e < n; e++)
          "string" == typeof arguments[e]
            ? t.appendChild(document.createTextNode(arguments[e]))
            : t.appendChild(arguments[e]);
        return t;
      }),
      (r.M = e => {
        document.head.insertAdjacentHTML(
          "beforeend",
          "<style>" + e + "</style>"
        );
      }),
      (r.O = (e, t) => {
        void 0 === i[1][e]
          ? (i[1][e] = t)
          : n("That component is already registered!");
      }),
      (r.T = e => {
        var t = e
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;"),
          o = /<script>(.|\s)+<\/script>/g;
        return (
          null !== t.match(o) &&
            (n(
              "a script tag were fed into the sanitizer and it was blocked due to it potentially being malicious."
            ),
            t.replace(o, "")),
          t
        );
      }),
      (r.C = () => i[6][0]),
      (r.I = e => {
        for (var n; n < i[6].length; n++) i[6][n].setAttribute("content", e);
      }),
      (r.J = e => (document.title = e)),
      (r.m = function(e) {
        var n = i[2][e].classList;
        n.toggle("a7-menu-" + e + "-open"),
          n.toggle("a7-menu-" + e + "-closed");
        var t = i[5][e];
        void 0 !== t && t(!0 === n.contains(open) ? "open" : "closed");
      }),
      (r.L = function(e) {
        var n = i[5][e];
        void 0 !== n && n("closed");
        var t = i[2][e].classList,
          o = "a7-menu-" + e + "-open",
          r = "a7-menu-" + e + "-closed";
        t.contains(o)
          ? (t.remove(o), t.add(r))
          : new Error("Menu " + e + " could not be closed");
      }),
      (r.q = (e, n) => (i[5][e] = n)),
      (r.path = e => {
        if (void 0 === e) return window.location.pathname.replace("/", "");
        0 !== e.indexOf("/") && (e = "/" + e),
          history.pushState
            ? history.pushState({}, void 0, e)
            : (window.location = e);
      }),
      (r.t = e => {
        0 !== e.indexOf("/") && (e = "/" + e);
        var n,
          o = e.slice(0, e.indexOf("/") + 1) + "*",
          a = i[0];
        if (a[e]) n = e;
        else if (a[o]) n = o;
        else {
          if (!a["D"])
            return console.error("A7JS: no specified route matched " + e);
          n = "/*";
        }
        var u,
          c,
          s = a[n](),
          d = s.getElementsByTagName("a");
        if (null !== d)
          for (u = 0; u < d.length; u++)
            "" === d[u].getAttribute("a7link") && t(d[u]);
        (c = s),
          0 !== i[7].children.length && i[7].removeChild(i[7].lastChild),
          i[7].appendChild(c),
          r.path(e),
          scrollTo(0, pageXOffset);
      }),
      r
    );
  })();
  e.O("page_2", {
    data: {},
    F: {},
    k: () =>
      e._(
        e.e(
          "div",
          0,
          e.e("h1", 0, "Teipiou Picture Gallery"),
          e.e("img", { src: "/img/omakuva.jpg" }),
          e.e("p", 0, "The Original"),
          e.e("img", { src: "/img/society.jpg" }),
          e.e("p", 0, "Society"),
          e.e("img", { src: "/img/all_seeing_eye.jpg" }),
          e.e("p", 0, "The All Seeing Eye"),
          e.e("img", { src: "/img/minecraft.jpg" }),
          e.e("p", 0, "The minecraft"),
          e.e("img", { src: "/img/PassTheBoof.jpg" }),
          e.e("p", 0, "The Pass The Boof"),
          e.e("img", { src: "/img/le_teipiou.jpg" }),
          e.e("p", 0, "Le Teipiou"),
          e.e("img", { src: "/img/videcheck.jpg" }),
          e.e("p", 0, "The Vibe Check")
        )
      )
  }),
    e.p({
      D: function(n) {
        return e.e("page_2", n);
      }
    }),
    e.M(
      "h1{text-align:center;font-family:Arial,Helvetica,sans-serif}p{font-size:x-large}img{height:300px}"
    );
})();
