
//compares two different versions
//returns true when the newV is newer than oldV
module.exports = {
    isNewer(newV, oldV){
        oldVersion = oldV.split(".");
        newVersion = newV.split(".");
        
        for(var i = 0; i < newVersion.length; i++){
            
            //currently compares only numbers
            if(newVersion[i] > oldVersion[i]){
                return true;
            } else if (newVersion.length - 1 === i){
                return false;
            }
        };

        return {
            oldV:oldVersion, 
            newV:newVersion
        };
    }
}