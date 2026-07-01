// 'use strict';

// const path = require('path');
// const dotenv = require('dotenv');
// dotenv.config({ path: path.resolve(__dirname, '../env.example') });

// const logger = require('./utils/logger');
// const connectDB = require('./config/db');
// const app = require('./app');

// // Connect to DB
// connectDB().then(() => {
//   const PORT = process.env.PORT || 3000;
//   const server = app.listen(PORT, () => {
//     logger.info(`Server started on port ${PORT}`);
//   });

//   // Graceful shutdown on uncaught exceptions
//   process.on('uncaughtException', (err) => {
//     logger.error('Uncaught Exception:', err && (err.stack || err));
//     try {
//       server.close(() => process.exit(1));
//     } catch (e) {
//       process.exit(1);
//     }
//   });

//   process.on('unhandledRejection', (reason) => {
//     logger.error('Unhandled Rejection:', reason);
//     try {
//       server.close(() => process.exit(1));
//     } catch (e) {
//       process.exit(1);
//     }
//   });

//   // cleanup on SIGINT
//   process.on('SIGINT', () => {
//     logger.info('SIGINT received, shutting down gracefully');
//     server.close(() => {
//       logger.info('Server closed');
//       process.exit(0);
//     });
//   });

//   module.exports = server;
// }).catch((err) => {
//   logger.error('Failed to connect to DB during startup', err);
//   process.exit(1);
// });
"use strict";

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const logger = require("./utils/logger");
const connectDB = require("./config/db");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");

// Connect to DB
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;

    // Create HTTP server from Express app
    const server = http.createServer(app);

    // Attach Socket.IO to the server
    const io = new Server(server, {
      cors: {
        // origin: "http://localhost:5173", // your Vite frontend
        origin: [
          "http://localhost:5173",
          "https://assist-inventory.vercel.app",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Socket.IO connection handler
    io.on("connection", (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Example: send a welcome notification
      socket.emit("notification", {
        type: "welcome",
        message: "Connected to server",
      });

      // Example: listen for order events
      socket.on("order_created", (order) => {
        logger.info("Order created:", order);
        // broadcast to all clients
        io.emit("notification", { type: "order_created", order });
      });

      socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });

    // Graceful shutdown handlers
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception:", err && (err.stack || err));
      try {
        server.close(() => process.exit(1));
      } catch (e) {
        process.exit(1);
      }
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Rejection:", reason);
      try {
        server.close(() => process.exit(1));
      } catch (e) {
        process.exit(1);
      }
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    module.exports = server;
  })
  .catch((err) => {
    logger.error("Failed to connect to DB during startup", err);
    process.exit(1);
  });
// For Running seeding as well
//   "use strict";

// const path = require("path");
// const dotenv = require("dotenv");
// dotenv.config({ path: path.resolve(__dirname, "../env.example") });

// const logger = require("./utils/logger");
// const connectDB = require("./config/db");
// const app = require("./app");
// const http = require("http");
// const { Server } = require("socket.io");

// (async () => {
//   try {
//     // Wait until DB is connected + seeded
//     await connectDB();

//     const PORT = process.env.PORT || 3000;
//     const server = http.createServer(app);

//     // Attach Socket.IO
//     const io = new Server(server, {
//       cors: {
//         origin: [
//           "http://localhost:5173",
//           "https://assist-inventory.vercel.app",
//         ],
//         methods: ["GET", "POST"],
//         credentials: true,
//       },
//     });

//     io.on("connection", (socket) => {
//       logger.info(`Client connected: ${socket.id}`);
//       socket.emit("notification", {
//         type: "welcome",
//         message: "Connected to server",
//       });

//       socket.on("order_created", (order) => {
//         logger.info("Order created:", order);
//         io.emit("notification", { type: "order_created", order });
//       });

//       socket.on("disconnect", () => {
//         logger.info(`Client disconnected: ${socket.id}`);
//       });
//     });

//     server.listen(PORT, () => {
//       logger.info(`🚀 Server started on port ${PORT}`);
//     });

//     // Graceful shutdown
//     process.on("uncaughtException", (err) => {
//       logger.error("Uncaught Exception:", err && (err.stack || err));
//       server.close(() => process.exit(1));
//     });

//     process.on("unhandledRejection", (reason) => {
//       logger.error("Unhandled Rejection:", reason);
//       server.close(() => process.exit(1));
//     });

//     process.on("SIGINT", () => {
//       logger.info("SIGINT received, shutting down gracefully");
//       server.close(() => {
//         logger.info("Server closed");
//         process.exit(0);
//       });
//     });

//     module.exports = server;
//   } catch (err) {
//     logger.error("❌ Failed to start application", err);
//     process.exit(1);
//   }
// })();
