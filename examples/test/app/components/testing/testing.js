export default {
    data: {
        a: "Make your amaizing app!"
    },
    functions: {
        onInit(self){
            self.id = "self"
        },

        click(){
            console.log("fired click");
        }
    }
}