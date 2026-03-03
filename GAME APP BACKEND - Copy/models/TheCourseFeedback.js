const mongoose = require("mongoose");

const TheCourseFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  }
}, { timestamps: true });


// 🔥 IMPORTANT: Prevent duplicate feedback
TheCourseFeedbackSchema.index(
  { userId: 1, courseId: 1, moduleId: 1 },
  { unique: true }
);

module.exports = mongoose.model("TheCourseFeedback", TheCourseFeedbackSchema);