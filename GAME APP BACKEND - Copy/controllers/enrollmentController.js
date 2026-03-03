const Enrollment = require("../models/Enrollment");

// =========================
// ENROLL COURSE
// =========================
exports.enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const existing = await Enrollment.findOne({ userId, courseId });

    if (existing) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const enrollment = new Enrollment({
      userId,
      courseId,
      paymentStatus: "free"
    });

    await enrollment.save();

    res.status(201).json({ message: "Enrollment successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =========================
// CHECK ENROLLMENT
// =========================
exports.checkEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId });

    res.json({ enrolled: !!enrollment });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserEnrolledCourses = async (req, res) => {
  try {

    const enrollments = await Enrollment.find({
      userId: req.params.userId
    }).populate("courseId");

    const courses = enrollments.map(e => e.courseId);

    res.json(courses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};