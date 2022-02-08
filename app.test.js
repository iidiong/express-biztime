process.env.NODE_ENV = 'test';
const request = require("supertest");
const app = require('./app');
const db = require('./db');


describe("Test companies", () => {
    test("should return all companies", async () => {
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toBe(200);
    });
});


afterAll( async () => {
    await db.end();

});