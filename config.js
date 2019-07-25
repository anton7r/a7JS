var appRoutes = a7.config.routes;
var appPages = a7.config.routes;

a7.config ={
    default_title: "a7.js",
    /** To make the router work you have to setup routes
     *  and the route's value should be a desired pages name. 
     * 
     *  Example if you give maybe someones profile page like "/users/user1" path for the router to resolve 
     *  it will first check if there is a direct match "/users/user1" if there is not
     *  then it will try and match "/users/*" if it didn't find it.
     *  then it will test for "/*" if it didnt find that then it will throw an error
     * 
     */
    routes: {
        "/*": "default"
    },
    /** Pages are essentially diffrent views.
     *  
     * 
     */
    pages: {
        default: {
            title: "a7JS app",
            description: "This is an a7JS app.",
            toView:function () {
                return a7.createElement("div", {}, 
                    a7.createElement("h1", {}, "This is the title"),
                    a7.createElement("p", {}, "this is the text"));
            },
        }
    },
};