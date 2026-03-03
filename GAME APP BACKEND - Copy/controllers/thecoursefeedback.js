// const TheCourseFeedback = require("../models/TheCourseFeedback");
const Module = require("../models/Module");
const Course = require("../models/Courses");
const TheCourseFeedback = require("../models/TheCourseFeedback");

// ==========================
// SIMPLE SENTIMENT LOGIC
// ==========================
function analyzeSentiment(text) {
  const positiveWords = ["good", "great", "excellent", "amazing", "clear"];
  const negativeWords = ["bad", "confusing", "poor", "worst", "difficult"];

  const lower = text.toLowerCase();

  if (positiveWords.some(word => lower.includes(word))) {
    return "positive";
  }

  if (negativeWords.some(word => lower.includes(word))) {
    return "negative";
  }

  return "neutral";
}

// ==========================
// SAVE COURSE FEEDBACK
// ==========================
exports.submitCourseFeedback = async (req, res) => {
  try {

    const { userId, courseId, moduleId, rating, comment } = req.body;

    // 🔥 CHECK DUPLICATE FIRST
    const existingFeedback = await TheCourseFeedback.findOne({
      userId,
      courseId,
      moduleId
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already submitted feedback for this module."
      });
    }

    const sentiment = analyzeSentiment(comment);

    const feedback = new TheCourseFeedback({
      userId,
      courseId,
      moduleId,
      rating,
      comment,
      sentiment
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      sentiment
    });

  } catch (error) {

    // If duplicate slips through DB index
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate feedback not allowed."
      });
    }

    res.status(500).json({ message: error.message });
  }
};



// ===============================
// GET FEEDBACK FOR TEACHER
// ===============================


exports.getTeacherFeedback = async (req, res) => {
  try {

    const { teacherId } = req.params;

    // 1️⃣ Get teacher courses
    const courses = await Course.find({ instructor: teacherId }).select("_id");

    const courseIds = courses.map(c => c._id);

    // 2️⃣ Get modules of those courses
    const modules = await Module.find({ courseId: { $in: courseIds } }).select("_id title courseId");

    const moduleIds = modules.map(m => m._id);

    // 3️⃣ Get feedback for those modules
    const feedbacks = await TheCourseFeedback.find({
      moduleId: { $in: moduleIds }
    })
    .populate("userId", "username email")
    .populate("courseId", "title")
    .populate("moduleId", "title");

    res.json(feedbacks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

