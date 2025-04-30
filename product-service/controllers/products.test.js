const request = require("supertest");
const container = require('../config/container');

const App = require("../app");

const app = new App(container).setupApp();

describe("products endpoint", () => {

  it("GET /id -->get single product", () => {
    return request(app)
      .get("/680f9a83b4102e4ca84ccdd4")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        console.log(response.body);
        expect(response.body).toBeDefined();
      })
  });

  it("GET /id --> 404 if not found", () => {});

  it("POST / -->create product", () => {});
});
