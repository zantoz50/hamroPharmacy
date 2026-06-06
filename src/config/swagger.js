// "use strict";

// const swaggerAutogen = require("swagger-autogen")();
// const path = require("path");

// const outputFile = path.join(__dirname, "swagger-output.json");
// const endpointFiles = [
//   path.join(__dirname, "../app.js"),
//   path.join(__dirname, "../routes/**/*.js"),
// ];

// const doc = {
//   swagger: "2.0",
//   info: {
//     title: "inventory API",
//     version: "1.0.0",
//     description: "API documentation for Inventory Management System",
//   },
//   host: "localhost:3000",
//   basePath: "/api/v1",
//   schemes: ["http"],
//   tags: [
//     { name: "Authentication", description: "Authentication endpoints" },
//     { name: "Tenants", description: "Tenant management endpoints" },
//     { name: "Inventory", description: "Inventory management endpoints" },
//     { name: "RawMaterials", description: "Raw material management endpoints" },
//     { name: "Orders", description: "Order processing endpoints" },
//     // { name: "Patient", description: "Patient management endpoints" },
//     // { name: "Diseases", description: "Disease management endpoints" },
//     // { name: "Locations", description: "Location management endpoints" },
//   ],
//   securityDefinitions: {
//     bearerAuth: {
//       type: "apiKey",
//       name: "Authorization",
//       in: "header",
//       description:
//         "JWT authorization header using the Bearer scheme. Example: 'Bearer <token>'",
//     },
//   },
//   security: [{ bearerAuth: [] }],
//   host: process.env.SWAGGER_HOST || "localhost:3000",
//   basePath: "/api/v1",
//   schemes: [process.env.SWAGGER_SCHEME || "http"],
// };

// if (require.main === module) {
//   swaggerAutogen(outputFile, endpointFiles, doc)
//     .then(() => {
//       console.log(`Swagger generated at: ${outputFile}`);
//     })
//     .catch((err) => {
//       console.error("Failed to generate Swagger documentation:", err);
//       process.exit(1);
//     });
// }

// module.exports = doc;
"use strict";

const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description: "API documentation for Inventory Management System",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
    tags: [
      { name: "Authentication", description: "Authentication endpoints" },
      { name: "Tenants", description: "Tenant management endpoints" },
      { name: "Inventory", description: "Inventory management endpoints" },
      {
        name: "RawMaterials",
        description: "Raw material management endpoints",
      },
      { name: "Orders", description: "Order processing endpoints" },
      { name: "Categories", description: "Category management under sectors" },
      { name: "Sectors", description: "Sector management endpoints" },
      {
        name: "SystemPreferences",
        description: "System preference and metadata endpoints",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT authorization header using the Bearer scheme. Example: 'Bearer <token>'",
        },
      },
      //       servers: [
      //   {
      //     url: `${process.env.SWAGGER_SCHEME || "http"}://${process.env.SWAGGER_HOST || "localhost:3000"}/api/v1`
      //   }
      // ],
      schemas: {
        Sector: {
          type: "object",
          properties: {
            sectorId: { type: "integer", example: 1 },
            name: {
              type: "string",
              enum: ["restaurant", "cafeteria", "mart"],
              example: "restaurant",
            },
            description: { type: "string", example: "Restaurant sector" },
            tenantId: {
              type: "string",
              format: "objectId",
              example: "60f7c0f9b54764421b7156a1",
            },
          },
          required: ["name", "tenantId"],
        },
        Category: {
          type: "object",
          properties: {
            categoryId: { type: "integer", example: 1 },
            name: { type: "string", example: "Starter" },
            sector: {
              type: "string",
              format: "objectId",
              example: "60f7c0f9b54764421b7156a2",
            },
            tenantId: {
              type: "string",
              format: "objectId",
              example: "60f7c0f9b54764421b7156a1",
            },
          },
          required: ["name", "sector", "tenantId"],
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, "../routes/**/*.js"),
    path.join(__dirname, "../app.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
