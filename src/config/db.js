"use strict";

const mongoose = require("mongoose");
const logger = require("../utils/logger");
const seedDefaultSectors = require("./seedSector");
const connectDB = async () => {
  const {
    MONGO_URI,
    MONGO_HOST = "localhost",
    MONGO_PORT = "27017",
    MONGO_DB = "inventory",
  } = process.env;

  const uri =
    MONGO_URI && MONGO_URI.trim().length > 0
      ? MONGO_URI
      : `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
  console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", async () => {
      logger.info(`Mongoose connected to ${uri}`);
      await seedDefaultSectors(); // ✅ seed defaults once
    });
    mongoose.connection.on("connected", () => {
      logger.info(`Mongoose connected to ${uri}`);
    });
    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error", err);
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("Mongoose connection closed on app termination");
      process.exit(0);
    });

    return mongoose.connection;
  } catch (err) {
    logger.error("Failed to connect to MongoDB", err);
    throw err;
  }
};

module.exports = connectDB;
