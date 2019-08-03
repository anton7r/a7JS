var app = a7.app;

app.routes = {
    "/*": "home"
};
app.pages = {
    home:{
        title:"Home",
        description:"Welcome to my site",
        onRoute:function(){
            a7.render(
                a7.createElement("h1", "", "Welcome to a7JS!")
            );
        }
    }
};