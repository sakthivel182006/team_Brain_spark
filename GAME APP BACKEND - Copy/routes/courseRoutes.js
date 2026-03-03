const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// CREATE
router.post('/', courseController.createCourse);
router.get("/courses/teacher/:teacherId", courseController.getCoursesByTeacher);
// READ (all)
router.get('/', courseController.getAllCourses);

// READ (by ID)
router.get('/:id', courseController.getCourseById);

// UPDATE
router.put('/:id', courseController.updateCourse);

// DELETE
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
