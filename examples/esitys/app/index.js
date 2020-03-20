import a7 from "a7js";
import sivu from "./components/sivu/sivu.js";
import testComponent from "./components/testComponent/testComponent.js";
import hienoNappi from "./components/hienoNappi/hienoNappi.js";
import toinenSivu from "./components/toinenSivu/toinenSivu.js";


a7.routes({
    "/*":sivu,
    "/toinen-sivu": toinenSivu,
    "/users": toinenSivu
});