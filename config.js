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
    /** Will change the html <title></title> of the app
     *  Titles arent that neccessary if you dont wanna change the title around when You're inside different paths. 
     *  if a tittle for a path is not defined it will return the default title
     */
    titles: {
        "/*": "a7.js App"
    },
    /** Pages are essentially diffrent views.
     *  
     * 
     */
    pages: {
        default: `
        <h1>Welcome to my a7.js app</h1>
        `
    },
    /**  Modules are smaller components than pages really useful for not repeating code
    How to access them?
    If you want to get the content of a module then use a7.module(modulename).get()
    If you want to set a modules content you can do by a7.module(modulename).set(new content goes here)

    You can now add modules to DOM by adding data-a7-render-module="modulename" and then calling the function a7.renderModules();
    It will also change the attribute from data-a7-render-module="modulename" to data-a7-module="modulename" because the module is then rendered
    */
    modules:{
        defaultmodule:"Hello i am a a7.js module",
    },
    /** Triggers are essentially functions that execute
     *  when the router routs to a new path/new stage on your applications flow.
     * 
     *  When the router executes the trigger function it will then feed the path splitten into an array and give it as 
     *  the first parameter to your trigger function.
     *  
     *  As an example you can maybe set a contents of an element to be a module 
     *  or get documents on the server relative to the path on the client.
    */
    triggers: {
        "/*": function(paths){
        }
    }
};