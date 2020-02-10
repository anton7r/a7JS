const version = require("./compare-versions");

test("should output true because the version is newer", () => {
    expect(version.isNewer("1.2.2", "1.2.1")).toBe(true);
})

test("should output false because the \"newer\" version is older", () => {
    expect(version.isNewer("1.6.5", "1.6.6")).toBe(false);
})

test('should output true because the -rc is stripped from the version number', () => {
    expect(version.isNewer("1.0.1", "1.0.0-rc1")).toBe(true);
});

test("should output true because the older version is a release candidate", () => {
    expect(version.isNewer("1.0.0", "1.0.0-rc1.3")).toBe(true);
})

test('both are beta', () => {
    expect(version.isNewer("1.0.0-beta2", "1.0.0-beta")).toBe(true);
});

test('beta vs alpha', () => {
    expect(version.isNewer("1.0.0-beta", "1.0.0-alpha")).toBe(true);
});

test('major difference', ()=> {
    expect(version.isNewer("4.0.0", "5.0.0-alpha1.1")).toBe(false);
});