// seedSectors.js
const { Sector } = require("../models/utilits.model");

const DEFAULT_SECTORS = [
  { sectorId: 1, name: "Restaurant", description: "Restaurant sector" },
  { sectorId: 2, name: "Cafeteria", description: "Cafeteria sector" },
  { sectorId: 3, name: "Mart", description: "Mart sector" },
];

async function seedDefaultSectors() {
  for (const sector of DEFAULT_SECTORS) {
    const exists = await Sector.findOne({ name: sector.name });
    if (!exists) {
      await Sector.create(sector);
    }
  }
}
module.exports = seedDefaultSectors;
