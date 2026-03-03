const Module = require('../models/Module');
const Course = require('../models/Courses');
const mongoose = require('mongoose');   // 🔥 YOU FORGOT THIS

exports.createModule = async (req, res) => {
    try {

        const { courseId, title, conceptTag, difficulty } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Video file required" });
        }

        const module = new Module({
            courseId,
            title,
            conceptTag,
            difficulty,
            videoUrl: req.file.path   // Cloudinary URL
        });

        await module.save();

        // Update modulesCount in course
        await Course.findByIdAndUpdate(courseId, {
            $inc: { modulesCount: 1 }
        });

        res.status(201).json(module);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getModulesByCourse = async (req, res) => {
  try {

    const modules = await Module.find({
      courseId: req.params.courseId
    });

    res.json(modules);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getModulesByCourse = async (req, res) => {
  try {

    const { courseId } = req.params;

    // 1️⃣ Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId format"
      });
    }

    // 2️⃣ Fetch modules
    const modules = await Module.find({
      courseId: new mongoose.Types.ObjectId(courseId)
    }).sort({ createdAt: 1 });

    // 3️⃣ Return response
    res.status(200).json(modules);

  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
      error: error.message
    });
  }
};