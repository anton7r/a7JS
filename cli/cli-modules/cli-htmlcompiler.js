//This file is used to compile html to our javascript equivelant code.
const HTMLParser = require("node-html-parser");

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
                        attrValue = attrValue.replace("()", "");
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
    attributes = JSON.stringify(attributes);

    var EvListener = attributes.match(/\"a7on\w*\":\"[\w|\d\_]*\"/i);

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



    return "a7.createElement(\'"+tag+"\',"+attributes+","+content+")";
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

    compiled = compiled.replace(/,$/, "");

    return compiled;
}

module.exports = function htmlCompiler(html){
    var compiled = "";
    var vDOM = HTMLParser.parse(html);
    var Nodes = vDOM.childNodes;
    var NodeCount = Nodes.length;

    for(var i = 0; i < NodeCount; i++){

        var currentNode = Nodes[i];
        //console.log(currentNode);

        var tag = currentNode.tagName;
        var inner = __ChildNodes(currentNode.childNodes);


        var attributes = currentNode.rawAttrs;
        compiled += buildEl(tag, attributes, inner) + ",";
        
    }
    compiled = compiled.replace(/\,\)/g, ")");
    compiled = compiled.replace(/\,\"\"/g, "");
    compiled = compiled.replace(/\)\,$/g, ")");

    return compiled;
};