const Course = require('../models/Courses');



exports.getCoursesByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const courses = await Course.find({ instructor: teacherId });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createCourse = async (req, res) => {
    try {

        const { title, description, level, price } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and description required" });
        }

        const course = new Course({
            title,
            description,
            level,
            price,
            instructor: req.body.instructor,
            modulesCount: 0
        });

        await course.save();

        res.status(201).json(course);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
