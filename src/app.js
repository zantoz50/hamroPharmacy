"use strict";

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");

const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./config/swagger-output.json");
const routes = require("./routes/index.routes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Logging
app.use(requestLogger);
app.use(morgan("combined", { stream: logger.stream }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// ✅ Swagger Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); //Old One
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, {
    tagsSorter: "alpha", // or custom function
    operationsSorter: "alpha",
  }),
);

// ✅ Root route (for convenience)
app.get("/", (req, res) => {
  res.send(
    'HamroPharacy API is running. Visit <a href="/api-docs">/api-docs</a> for documentation.',
  );
});

// Static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/api/v1", routes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found santosh" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
