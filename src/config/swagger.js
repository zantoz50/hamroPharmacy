"use strict";

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerAutogen = require("swagger-autogen")();

const path = require("path");

const options = {
  definition: {
    openapi: "3.0.3",
    //   info: {
    //     title: "HamroPharacy API",
    //     version: "1.0.0",
    //     description:
    //       "API documentation for HamroPharacy - Patient management system with JWT Auth and OCR integration.",
    //   },
    //   servers: [
    //     {
    //       url: "http://localhost:3000/api/v1",
    //       description: "Local Server",
    //     },
    //   ],
    //   components: {
    //     securitySchemes: {
    //       BearerAuth: {
    //         type: "http",
    //         scheme: "bearer",
    //         bearerFormat: "JWT",
    //       },
    //     },
    //     tags: [
    //       { name: "Auth", description: "Auth " },
    //       { name: "Patient", description: "Patient Controllers" },
    //     ],
    //   },
    //   security: [{ BearerAuth: [] }], // apply to all endpoints

    info: {
      title: "HamroPharacy API",
      description:
        "API documentation for HamroPharacy - Patient Management System with JWT Authentication and OCR integration.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local Server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Patient", description: "Patient management APIs" },
      { name: "Disease", description: "Disease management APIs" },
      { name: "Location", description: "Doctor management APIs" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // 👇 Where Swagger will look for annotations

  apis: [path.join(__dirname, "../routes/**/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

const outputFile = "./swagger-output.json";
const routes = ["./src/app.js"]; // or your main route entry file
swaggerAutogen(outputFile, routes, options);

module.exports = swaggerSpec;
