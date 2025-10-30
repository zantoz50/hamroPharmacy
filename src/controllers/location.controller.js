"use strict";

const Location = require("../models/location"); // adjust path as needed
const mongoose = require("mongoose");

/**
 * @swagger
 * tags: [Location]
 */

/**
 * Controller for Location model
 * Exports CRUD handlers suitable for use as Express route handlers.
 */

/**
 * Create a new Location
 * Expects JSON body: { name: string (required), address?: string, coordinates?: { lat?: number, lng?: number } }
 */
async function createLocation(req, res) {
  try {
    const { name, address, coordinates } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res
        .status(400)
        .json({ error: "Name is required and must be a non-empty string." });
    }

    const loc = new Location({
      name: name.trim(),
      address: address ? String(address).trim() : undefined,
      coordinates:
        coordinates && typeof coordinates === "object"
          ? {
              lat:
                typeof coordinates.lat === "number"
                  ? coordinates.lat
                  : undefined,
              lng:
                typeof coordinates.lng === "number"
                  ? coordinates.lng
                  : undefined,
            }
          : undefined,
    });

    const saved = await loc.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("createLocation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get list of Locations with optional pagination and filtering
 * Query params:
 *  - page (default 1)
 *  - limit (default 20)
 *  - q (search text applied to name and address, case-insensitive, partial)
 *  - sort (e.g. "createdAt" or "-name")
 */
async function getLocations(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit, 10) || 20)
    );
    const q = req.query.q ? String(req.query.q).trim() : null;
    const sort = req.query.sort ? String(req.query.sort) : "-createdAt";

    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape regex chars
      filter.$or = [{ name: re }, { address: re }];
    }

    const [items, total] = await Promise.all([
      Location.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Location.countDocuments(filter).exec(),
    ]);

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("getLocations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get a single Location by ID
 */
async function getLocationById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const loc = await Location.findById(id).exec();
    if (!loc) return res.status(404).json({ error: "Location not found" });
    return res.json(loc);
  } catch (err) {
    console.error("getLocationById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Update a Location by ID (partial updates allowed)
 * Accepts same fields as createLocation
 */
async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const update = {};
    if (req.body.name !== undefined) {
      if (
        !req.body.name ||
        typeof req.body.name !== "string" ||
        !req.body.name.trim()
      ) {
        return res
          .status(400)
          .json({ error: "Name must be a non-empty string when provided." });
      }
      update.name = req.body.name.trim();
    }
    if (req.body.address !== undefined) {
      update.address = req.body.address ? String(req.body.address).trim() : "";
    }
    if (req.body.coordinates !== undefined) {
      const c = req.body.coordinates;
      update.coordinates = {};
      if (c && typeof c === "object") {
        if (c.lat !== undefined)
          update.coordinates.lat =
            typeof c.lat === "number" ? c.lat : undefined;
        if (c.lng !== undefined)
          update.coordinates.lng =
            typeof c.lng === "number" ? c.lng : undefined;
      }
    }

    const updated = await Location.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).exec();
    if (!updated) return res.status(404).json({ error: "Location not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateLocation error:", err);
    // Mongoose validation error handling
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete a Location by ID
 */
async function deleteLocation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const removed = await Location.findByIdAndDelete(id).exec();
    if (!removed) return res.status(404).json({ error: "Location not found" });
    return res.status(204).send();
  } catch (err) {
    console.error("deleteLocation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
