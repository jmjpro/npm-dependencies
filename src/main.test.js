const main = require("./main")
// @ponicode
describe("main.default", () => {
    test("0", async () => {
        await main.default("Abruzzo", "^5.0.0")
    })

    test("1", async () => {
        await main.default("Alabama", "v1.2.4")
    })

    test("2", async () => {
        await main.default("Île-de-France", "v1.2.4")
    })

    test("3", async () => {
        await main.default("Île-de-France", "1.0.0")
    })

    test("4", async () => {
        await main.default("Florida", "v4.0.0-rc.4")
    })

    test("5", async () => {
        await main.default(undefined, undefined)
    })
})
