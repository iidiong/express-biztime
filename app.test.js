process.env.NODE_ENV = 'test';
const request = require("supertest");
const app = require('./app');
const db = require('./db');

let invoiceId;

describe("Test companies and invoice routes", () => {
    
    test("should return all companies", async () => {
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toBe(200);
    });
    test("should return company by code", async () => {
        const resp = await request(app).get("/companies/apple");
        expect(resp.statusCode).toBe(200);
    });
    test("should return 404 for invalid company code", async () => {
        const resp = await request(app).get("/companies/apple1");
        expect(resp.statusCode).toBe(404);
    });
    test("should create new company", async () => {
        const resp = await request(app).post("/companies").send({
            "code": "Citi",
            "name": "Citi Bank",
            "description": "Banking."
        });
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            "company": {
                "code": "Citi",
                "name": "Citi Bank",
                "description": "Banking."
            }
        })
    });
    test("should update company 'name' and 'description'", async () => {
        const resp = await request(app).put("/companies/Citi").send({
            "name": "Citi Bank updated",
            "description": "Banking updated."
        });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            "company":
            {
                "code": "Citi",
                "name": "Citi Bank updated",
                "description": "Banking updated."
            }
        })
    });

    test("should return all invoices", async () => {
        const resp = await request(app).get("/invoices");
        expect(resp.statusCode).toBe(200);
    });
    test("should create new invoice", async () => {
        const resp = await request(app).post("/invoices").send({
            "comp_code": "Citi",
            "amt": "500"
        });
        let result = await request(app).get("/invoices")
        invoiceId = await result.body.invoices[result.body.invoices.length - 1].id;
        expect(resp.statusCode).toBe(201);
    });
    test("should return invoice by id", async () => {
        const resp = await request(app).get(`/invoices/${invoiceId}`);
        expect(resp.statusCode).toBe(200);
    });
    test("should return 404 for invalid invoices code", async () => {
        const resp = await request(app).get("/invoices/100");
        expect(resp.statusCode).toBe(404);
    });
   
    test("should update invoice 'name' and 'description'", async () => {
        const resp = await request(app).put("/invoices/1").send({
            "amt": "790"
        });
        expect(resp.statusCode).toBe(200);
    });
    test("should delete invoice from db", async () => {
        
        const resp = await request(app).delete(`/invoices/${invoiceId}`);
        expect(resp.statusCode).toBe(200);
    });
    test("should delete company from db", async () => {
        const resp = await request(app).delete("/companies/Citi");
        expect(resp.statusCode).toBe(200);
    });
});

afterAll(async () => {
    await db.end();

});