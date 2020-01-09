//this file will be executed on the frontend!

var css = `body{
    background-color:rgb(27, 27, 27);
}
header{
    font-family: Arial;
    font-size: 30px;
    color: red;
    margin-top: 20px;
    margin-left: 150px;
}
#file{
    font-family: arial;
    font-size: 22px;
    text-align: left;
    margin-left: 150px;
    color: white;
}
`

var template = `<header>Error: $errormsg</header>
<div id="file">
    <p> $file<br>$file2</p>
</div>`

addEventListener("error", function(ev){
    
    
});