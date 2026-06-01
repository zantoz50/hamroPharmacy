const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);

// // Inside your database utilities file (e.g., dbUtils.js or counterModel.js)
// const mongoose = require("mongoose");

// // Define a Counter Schema if you haven't already
// const CounterSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   seq: { type: Number, default: 0 },
// });

// const Counter =
//   mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

// async function getNextSequence(sequenceName) {
//   const counter = await Counter.findOneAndUpdate(
//     { _id: sequenceName }, // Find the document named "patient_id"
//     { $inc: { seq: 1 } }, // Increment the counter field by 1
//     { new: true, upsert: true }, // Critical: Create it if it doesn't exist yet!
//   );

//   return counter.seq;
// }

// module.exports = { getNextSequence };
