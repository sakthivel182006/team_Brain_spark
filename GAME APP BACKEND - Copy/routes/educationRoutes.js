const express = require("express");
const router = express.Router();
const upload = require("../config/cloudinaryStorage");

// Controllers
const assessmentCtrl = require("../controllers/assessmentController");
const agentCtrl = require("../controllers/agentController");
const courseController = require("../controllers/courseController");
const moduleController = require("../controllers/moduleController");

const enrollmentCtrl = require("../controllers/enrollmentController");
const feedbackCtrl = require("../controllers/thecoursefeedback");
const moduleAnalysisCtrl = require("../llm/moduleAnalysisController");

// ==========================
// AI & Assessment Routes
// ==========================
router.post("/assessment", assessmentCtrl.saveAssessment);
router.post("/agent/analyze", agentCtrl.analyzeLearner);


// ==========================
// COURSE ROUTES
// ==========================

router.get("/llm/analysis/teacher/:teacherId",moduleAnalysisCtrl.getTeacherAnalyses);
router.post("/enroll", enrollmentCtrl.enrollCourse);
router.get("/enroll/check/:userId/:courseId", enrollmentCtrl.checkEnrollment);
router.get("/enroll/user/:userId", enrollmentCtrl.getUserEnrolledCourses);
router.get("/modules/course/:courseId", moduleController.getModulesByCourse);
router.post("/feedback", feedbackCtrl.submitCourseFeedback);
router.get("/feedback/teacher/:teacherId", feedbackCtrl.getTeacherFeedback);


router.post("/llm/analyze-module", moduleAnalysisCtrl.analyzeModule);
router.post("/llm/save-analysis", moduleAnalysisCtrl.saveAnalysis);

router.post("/courses", courseController.createCourse);
router.get("/courses", courseController.getAllCourses);
router.get("/courses/:id", courseController.getCourseById);
router.get("/courses/teacher/:teacherId", courseController.getCoursesByTeacher);
router.put("/courses/:id", courseController.updateCourse);
router.delete("/courses/:id", courseController.deleteCourse);


// ==========================
// MODULE ROUTES
// ==========================
router.post("/modules", upload.single("video"), moduleController.createModule);


module.exports = router;