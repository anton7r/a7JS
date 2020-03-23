const HTMLParser = require("node-html-parser");
const errorHandler = require("../core/errorhandler");
const safeMatch = require("../utils/safematch")

function buildEl(tag, src, content) {
    var attributes = {};
    if (src !== undefined) {
        var srcAttr = safeMatch(src, /(\@|)[\w\d\.\:]+?\=(\'[^']+\'|\{\{\s*[\w\d]+\s*\}\}|[^\s]+)/g);

        //loop trough attributes
        srcAttr.forEach(val => {
            console.log(val);
            var name = val.match(/[^=]+/)[0];
            var value = val.match(/[^=]+$/)[0].replace(/\'/g, "");
            //is not a property
            if (name.indexOf("@") !== 0) {
                if (name.indexOf("a7on") === 0) value = `this.functions.${value.replace("()", "")}`;
                attributes[name] = value;
            } else {
                if (attributes.props === undefined) attributes.props = {};
                attributes.props[name.replace("@", "")] = value;
            }
        });
    }

    if (src.match("a7link") !== null) attributes.a7link = "";
    attributes = JSON.stringify(attributes);
    //replaces evlisteners with the real thing
    var ev = safeMatch(attributes, /\"a7on\w*\":\"[\w\d\_\.]*\"/gi);
    ev.forEach(val => {
        var event = val.match(/\".+?\"/);
        var listener = val.match(/\:\".+?\"/)[0].replace(/\"/g, "");
        attributes = attributes.replace(val, event + listener);
    });
    if (attributes === "{}") attributes = 0;
    else attributes = attributes.replace(/\"/g, "'");

    return `a7.createElement(\'${tag}\',${attributes},${content}),`;
}

function __ChildNodes(nodes) {
    var compiled = "";
    if (nodes.length === 0) return "";

    nodes.forEach(node => {
        if (node.tagName !== undefined) compiled += buildEl(node.tagName, node.rawAttrs, __ChildNodes(node.childNodes) + ",");
        else compiled += `\'${node.rawText}\',`;
    });
    return compiled.replace(/,\)/, ")").replace(/\',\)/, "')");
}

module.exports = (html, path) => {
    html = html
        .replace(/\r\n\s+/g, "")
        .replace(/\>\s/g, ">")
        .replace(/\s\</g, "<")
        .replace(/\"/g, "\'");

    var compiled = "";
    var Nodes = HTMLParser.parse(html).childNodes;
    var count = Nodes.length;
    if (count > 1) errorHandler.addError({
        error: "more than one root element was found",
        file: path
    });
    for (var i = 0; i < count; i++) {
        var tag = Nodes[i].tagName;
        var inner = __ChildNodes(Nodes[i].childNodes);
        var attributes = Nodes[i].rawAttrs;
        compiled += buildEl(tag, attributes, inner);
    }
    return compiled.replace(/\,\)/g, ")").replace(/\,\"\s*\"/g, "").replace(/\)\,$/g, ")").replace(/\',\)/g, "')").replace(/\),\)/g, "))");
};