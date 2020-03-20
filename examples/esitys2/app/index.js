import a7 from "a7js";
import hello from "./components/hello/hello.js";


a7.routes({
    "/*": hello
});