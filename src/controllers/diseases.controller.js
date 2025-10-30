"use strict";

const Disease = require("../models/disease"); // adjust path as needed
const mongoose = require("mongoose");

/**
 * @swagger
 * tags: [Disease]
 */

/**
 * Controller for Disease model
 * Exports CRUD handlers suitable for use as Express route handlers.
 */

/**
 * Create a new Disease
 * Expects JSON body: { name: string (required, unique), code?: string, icd10?: string, description?: string }
 */
async function createDisease(req, res) {
  try {
    const { name, code, icd10, description } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res
        .status(400)
        .json({ error: "Name is required and must be a non-empty string." });
    }

    const disease = new Disease({
      name: name.trim(),
      code: code ? String(code).trim() : undefined,
      icd10: icd10 ? String(icd10).trim() : undefined,
      description: description ? String(description).trim() : undefined,
    });

    const saved = await disease.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("createDisease error:", err);
    if (err.name === "MongoServerError" && err.code === 11000) {
      // Duplicate key error (unique name)
      return res
        .status(409)
        .json({ error: "Disease with this name already exists." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get list of Diseases with optional pagination and filtering
 * Query params:
 *  - page (default 1)
 *  - limit (default 20)
 *  - q (search text applied to name, code, icd10, description, case-insensitive, partial)
 *  - sort (e.g. "createdAt" or "-name")
 */
async function getDiseases(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(200, parseInt(req.query.limit, 10) || 20)
    );
    const q = req.query.q ? String(req.query.q).trim() : null;
    const sort = req.query.sort ? String(req.query.sort) : "-createdAt";

    const filter = {};
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex chars
      const re = new RegExp(escaped, "i");
      filter.$or = [
        { name: re },
        { code: re },
        { icd10: re },
        { description: re },
      ];
    }

    const [items, total] = await Promise.all([
      Disease.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Disease.countDocuments(filter).exec(),
    ]);

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("getDiseases error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get a single Disease by ID
 */
async function getDiseaseById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const disease = await Disease.findById(id).exec();
    if (!disease) return res.status(404).json({ error: "Disease not found" });
    return res.json(disease);
  } catch (err) {
    console.error("getDiseaseById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Update a Disease by ID (partial updates allowed)
 * Accepts same fields as createDisease
 */
async function updateDisease(req, res) {
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
    if (req.body.code !== undefined) {
      update.code = req.body.code ? String(req.body.code).trim() : "";
    }
    if (req.body.icd10 !== undefined) {
      update.icd10 = req.body.icd10 ? String(req.body.icd10).trim() : "";
    }
    if (req.body.description !== undefined) {
      update.description = req.body.description
        ? String(req.body.description).trim()
        : "";
    }

    const opts = { new: true, runValidators: true, context: "query" };
    const updated = await Disease.findByIdAndUpdate(
      id,
      { $set: update },
      opts
    ).exec();
    if (!updated) return res.status(404).json({ error: "Disease not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateDisease error:", err);
    if (err.name === "MongoServerError" && err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Disease with this name already exists." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete a Disease by ID
 */
async function deleteDisease(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const removed = await Disease.findByIdAndDelete(id).exec();
    if (!removed) return res.status(404).json({ error: "Disease not found" });
    return res.status(204).send();
  } catch (err) {
    console.error("deleteDisease error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createDisease,
  getDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
};
