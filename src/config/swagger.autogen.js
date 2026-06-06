// src/config/swagger-autogen.js
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Hamro Pharmacy API",
    description: "API documentation",
  },
  host: "localhost:5000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json"; // where the file will be written
// const endpointsFiles = ["./src/routes/systemPreference.route.js"]; // add all your route files here
const endpointsFiles = [
  "./src/routes/auth.routes.js",
  "./src/routes/inventory.routes.js",
  "./src/routes/orders.routes.js",
  "./src/routes/rawMaterials.routes.js",
  "./src/routes/tenants.routes.js",
  "./src/routes/categories.routes.js",
  "./src/routes/systemPreference.route.js",
];
swaggerAutogen(outputFile, endpointsFiles, doc);
