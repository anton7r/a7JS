
//compares two different versions
//returns true when the newV is newer than oldV
module.exports = {
    isNewer(newV, oldV){
        var oldVersion = oldV.split(".");
        var newVersion = newV.split(".");
        var i = 0;
        while(true){
            var newHasDash = false;
            var oldHasDash = false;

            if(newVersion[i].includes("-")){
                newVersion[i] = newVersion[i].split("-")[0];
                newHasDash = true;
            }

            if(oldVersion[i].includes("-")){
                oldVersion[i] = oldVersion[i].split("-")[0];
                oldHasDash = true;
            }

            if(oldVersion[i] > newVersion[i]) return false;
            else if(newVersion[i] > oldVersion[i]) return true;   
            else if (oldHasDash === true && newHasDash === false && newVersion[i] == oldVersion[i]) return true;
            else if (oldHasDash === false && newHasDash === true && newVersion[i] == oldVersion[i]) return false;
            else if (oldHasDash === true && newHasDash === true) break;
            else if (newVersion.length - 1 === i && oldVersion.length - 1 === i) return false;
            else if (newVersion.length - 1 === i && oldVersion.length - 1 !== i) break;
            else if (newVersion.length - 1 !== i && oldVersion.length - 1 === i) break;
            i++;
        };

        var newVstage = newV.split("-")[1];
        var oldVstage = oldV.split("-")[1];
        var newStage = 0;
        var oldStage = 0;

        //convers alpha to 0 and  beta to 1 and rc to 2
        // then compares them
        if(newVstage.indexOf("alpha") === 0){
            newVstage = newVstage.replace("alpha", "");
        } else if(newVstage.indexOf("beta") === 0){
            newStage = 1;
            newVstage = newVstage.replace("beta", "");
        } else if(newVstage.indexOf("rc") === 0){
            newStage = 2;
            newVstage = newVstage.replace("rc", "")
        } else return console.error("Unsupported stage");

        if(oldVstage.indexOf("alpha") === 0){
            oldVstage = oldVstage.replace("alpha", "");
        } else if (oldVstage.indexOf("beta") === 0){
            oldStage = 1;
            oldVstage = oldVstage.replace("beta", "");
        } else if(oldVstage.indexOf("rc") === 0){
            oldStage = 2;
            oldVstage = oldVstage.replace("rc", "");
        } else return console.error("Unssupported stage");

        if (newStage > oldStage) return true;
        else if (oldStage > newStage) return false;

        var newerStages = newVstage.split(".");
        var olderStages = oldVstage.split(".");

        if(newerStages[0] === "") newerStages[0] = 1;
        if (olderStages[0] === "") olderStages[0] = 1;

        i = 0;
        while(true){
            if(newerStages[i] > olderStages[i]) return true;
            else if(newerStages.length - 1 === i) return false;
            i++;
        }
    }
}