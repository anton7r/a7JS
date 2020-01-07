const fsx = require("./fsx");

test('should return path with forward slashes', () => {
    expect(fsx.formatSlashes("./dir\\2/3\\4")).toBe("./dir/2/3/4")
});

test('should return path without ../ in the middle', () => {
    expect(fsx.purePath("./dir/../")).toBe("./");
});