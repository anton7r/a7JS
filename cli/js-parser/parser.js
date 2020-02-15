module.exports = sourceCode => {
    var parser = {};

    parser.getImports = () => {
        imports = sourceCode.match(/import\s+(\d|\w|\_)+\s+from\s*\".+\";*/gi);
        imports2 = sourceCode.match(/import\s*{\s*.*?\s*}\s+from\s*\".+?\";*/gi);

        totalImports = [];

        if(imports !== null){
            
        } else {
            return [];
        }

    } 

    parser.parseObject = function(){
        srcObject = sourceCode;
    }

    parse.getExports = function(){

    }

    return parser;
}