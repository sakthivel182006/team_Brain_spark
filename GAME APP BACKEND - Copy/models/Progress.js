const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  completed: { type: Boolean, default: false },
  watchTime: { type: Number, default: 0 },
  quizScore: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

ProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);