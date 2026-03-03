const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  conceptTag: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  difficultyLevel: { type: Number, min: 1, max: 5 },
  timeTaken: Number
}, { timestamps: true });

module.exports = mongoose.model("Assessment", AssessmentSchema);