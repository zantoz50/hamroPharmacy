// seedSectors.js
const { Sector } = require("../models/utilits.model");

const DEFAULT_SECTORS = [
  { sectorId: 1, name: "Restaurant", description: "Restaurant sector" },
  { sectorId: 2, name: "Cafeteria", description: "Cafeteria sector" },
  { sectorId: 3, name: "Mart", description: "Mart sector" },
];

async function seedDefaultSectors() {
  for (const def of DEFAULT_SECTORS) {
    // Check if sector exists by name
    const existing = await Sector.findOne({ name: def.name });

    if (!existing) {
      // Insert if missing
      await new Sector(def).save();
    } else if (existing.sectorId !== def.sectorId) {
      // Update sectorId if mismatched
      await Sector.updateOne(
        { _id: existing._id },
        {
          $set: {
            sectorId: def.sectorId,
            description: def.description,
            isActive: true,
          },
        },
      );
    }
  }

  console.log("✅ Default sectors ensured/updated");
}
module.exports = seedDefaultSectors;
