export default function(){
    var a = "Make your amaizing app!";
    
    function onInit(self){
        self.id = "self"
    }

    function click(){
        console.log("fired click");
    }

    return({
        tag:"testing",
        template:"./testing.html",
        styles:"./testing.css"
    });
}