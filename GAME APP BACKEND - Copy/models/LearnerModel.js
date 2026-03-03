const mongoose = require("mongoose");

const LearnerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },

  knowledgeMap: { type: Object, default: {} },

  weakAreas: [String],
  strongAreas: [String],

  learningSpeed: { type: String, enum: ["slow", "medium", "fast"], default: "medium" },

  recommendedNext: {
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    reason: String
  }

}, { timestamps: true });

module.exports = mongoose.model("LearnerModel", LearnerSchema);