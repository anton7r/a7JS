import a7 from "a7js";
import page1 from "./components/page1/page1.js";
import page2 from "./components/page2/page2.js";

a7.routes({
    "/*":page1,
    "/page2":page2
});