// seedSectors.js
const { default: mongoose } = require("mongoose");
const { Sector } = require("../models/utilits.model");

const DEFAULT_SECTORS = [
  {
    sectorId: 1,
    name: "Restaurant",
    description: "Restaurant sector",
    isActive: true,
    color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    icon: "utensils", // symbolic name
  },
  {
    sectorId: 2,
    name: "Cafeteria",
    description: "Cafeteria sector",
    isActive: true,
    color: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    icon: "coffee",
  },
  {
    sectorId: 3,
    name: "Mart",
    description: "Mart sector",
    isActive: true,
    color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    icon: "shopping-bag",
  },
];

async function seedDefaultSectors() {
  console.log("🔄 Starting sector seeding...");
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
            color: def.color,
            icon: def.icon,
            isActive: true,
          },
        },
      );
      console.log(`🔄 Updated sector: ${def.name}`);
    }
  }

  console.log("✅ Default sectors ensured/updated");
}

// (async () => {
//   try {
//     const uri =
//       process.env.MONGO_URI ||
//       `mongodb://${process.env.MONGO_HOST || "localhost"}:${process.env.MONGO_PORT || "27017"}/${process.env.MONGO_DB || "inventory-plus"}`;

//     console.log("📡 Connecting to MongoDB:", uri);
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ Connected to MongoDB");

//     await seedDefaultSectors();
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   } catch (err) {
//     console.error("❌ Seeder failed:", err);
//     process.exit(1);
//   }
//})();
module.exports = seedDefaultSectors;
