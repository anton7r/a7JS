/* jshint -W104 */
/* jshint -W119 */

//This file is used to compile html to our javascript equivelant code.
const HTMLParser = require("node-html-parser");
const errorHandler = require("../core/errorhandler");

function buildEl(tag, src, content){
    var attributes = {};
    if(src !== undefined){
        var srcAttr = src.match(/(\@|)(\w|\d|\.)+?\=\'[^']+\'/g);
        if(srcAttr !== null){
            srcAttr.forEach(function(val){
                var attrName = val.match(/[^=]+/)[0];
                var attrValue = val.match(/[^=]+$/)[0].replace(/\'/g, "");
                //is not a property
                if(attrName.indexOf("@") !== 0){
                    if(attrName.indexOf("a7on") === 0){
                        attrValue = "this.functions." + attrValue.replace("()", "");
                    }
                    attributes[attrName] = attrValue;
                } else {
                    if(attributes.props === undefined){
                        attributes.props = {};
                    }
                    var attrRName = attrName.replace("@", "");
                    attributes.props[attrRName] = attrValue;
                }
            });
        }
    }

    if (src.match("a7link") !== null){
        attributes.a7link = "";
    }
    attributes = JSON.stringify(attributes);
    //replaces evlisteners with the real thing
    var EvListener = attributes.match(/\"a7on\w*\":\"[\w|\d\_\.]*\"/gi);
    if(EvListener !== null){
        EvListener.forEach(function(val){
            var event = val.match(/\".+?\"/);
            var listener = val.match(/\:\".+?\"/)[0].replace(/\"/g, "");
            attributes = attributes.replace(val, event + listener);
        });
    }
    if(attributes === "{}"){
        attributes = 0;
    } else {
        attributes = attributes.replace(/\"/g, "'");
    }

    return "a7.createElement(\'"+tag+"\',"+attributes+","+content+"),";
}

function __ChildNodes(nodes){

    var compiled = "";

    if(nodes.length === 0){
        return "";
    }

    nodes.forEach(function(_node){
        if(_node.tagName !== undefined){
            compiled += buildEl(_node.tagName, _node.rawAttrs,__ChildNodes(_node.childNodes) + ",");
        } else {
            compiled += "\'" + _node.rawText + "\',";
        }
    });
    return compiled.replace(/,\)/, ")").replace(/\',\)/, "')");
}

module.exports = function htmlCompiler(html){
    html = html.replace(/\s+/g, " ").replace(/\r\n/g, "").replace(/\>\s/g, ">").replace(/\s\</g, "<").replace(/\"/g, "\'");
    var compiled = "";
    //parses html
    var Nodes = HTMLParser.parse(html).childNodes;
    var NodeCount = Nodes.length;

    if (NodeCount > 1){
        errorHandler.addError({
            error:"more than one root element was found", file:"unknown"
        })
    }


    for(var i = 0; i < NodeCount; i++){
        var currentNode = Nodes[i];
        var tag = currentNode.tagName;
        var inner = __ChildNodes(currentNode.childNodes);
        var attributes = currentNode.rawAttrs;
        compiled += buildEl(tag, attributes, inner);
    }
    return compiled.replace(/\,\)/g, ")").replace(/\,\"\"/g, "").replace(/\)\,$/g, ")").replace(/\',\)/g, "')").replace(/\),\)/g, "))");
};