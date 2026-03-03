const mongoose = require("mongoose");

const ModuleAIAnalysisSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  aiResult: { type: String, required: true },
  healthScore: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ModuleAIAnalysis", ModuleAIAnalysisSchema);