module.exports = (s, regexp) => {
    var m = s.toString().match(regexp);
    if(m !== null) return m;
    return [];
}