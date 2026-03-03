const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const portfolioFeedback = require("./routes/portfoliofeedback");
const feedbackRoutes = require("./routes/feedbackRoutes");

const connectDB = require('./config/db');
const authRoutes = require('./routes/userRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const githubRoutes = require("./routes/github.js");

const mcqquestionRoutes = require('./routes/mcqQuestionRoutes');
const testRoutes = require('./routes/testRoutes');

const paymentRoutes = require('./routes/paymentRoutes');
const useramountdistributionroutes = require('./routes/userAmountRoutes');

const collegeRoutes = require('./routes/collegeRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const summaryroutes = require('./routes/summaryRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

const courseRoutes = require('./routes/courseRoutes');
const courseTopicRoutes = require('./routes/courseTopicRoutes');
const sourceCodeRoutes = require('./routes/sourceCodeRoutes');

const teacherMcqQuestionRoutes = require('./routes/teachermcqtypequestionaddcontrollerroutes');
const teacherMcqTypeRoutes = require('./routes/teachermcqtypeaddcontrollerroutes');
const teacherMcqQuestionsubmissionRoutes = require('./routes/teachermcqsubmissionreportroutes');

const paymentPlanRoutes = require('./routes/paymentPlanRoutes');
const collegeOrderRoutes = require('./routes/collegeOrderRoutes');
const geminiRoutes = require('./routes/geminiRoutes.js');

const compilerRoutes = require('./routes/compilerRoutes');
const countryRoutes = require("./routes/countryRoutes");

//neopassssssssssssss

const neoAuthRoutes = require('./routes/neoAuthRoutes');

const nvidiaRoutes =require("./llm/nvidiaRoutes.js");
const llmRoutes = require('./routes/llmRoutes');


const educationRoutes = require('./routes/educationRoutes');

dotenv.config();
connectDB();

const app = express();

/* ======================
CORS
====================== */
app.use(cors({
   origin: '*',
   credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

/* ======================
✅ CORRECT UPLOADS SETUP (FIXED)
====================== */

// 🔹 ONE uploads folder only
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
   console.log('Uploads directory created successfully');
}

// 🔹 Serve uploads (HTTPS-safe)
app.use("/uploads", express.static(uploadDir));

/* ======================
STATIC PUBLIC FILES
====================== */
app.use(express.static(path.join(__dirname, 'public')));
// 
/* ======================
ROUTES
====================== */

app.get('/', (req, res) => {
   res.send('Hello World!');
});


app.use('/api/agent', educationRoutes);

app.use('/api/llm', llmRoutes);

//neo passsssssssss
app.use('/api', neoAuthRoutes);

app.use("/api/nvidia", nvidiaRoutes);




// 🔹 Country APIs
app.use("/api/countrydetails", countryRoutes);

// 🔹 Other APIs (unchanged)
app.use('/api/teachers', teacherMcqQuestionsubmissionRoutes);
app.use('/api/paymentplans', paymentPlanRoutes);
app.use('/api', collegeOrderRoutes);
app.use('/api/teachers', teacherMcqQuestionRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/teachers', teacherMcqTypeRoutes);
app.use('/api/courses2', courseRoutes);
app.use('/api/coursestopics', courseTopicRoutes);
app.use('/api/sourcecodes', sourceCodeRoutes);
app.use("/api/github", githubRoutes);
app.use('/api', useramountdistributionroutes);
app.use('/api', paymentRoutes);
app.use('/api', authRoutes);
app.use('/api', mcqRoutes);
app.use('/api', summaryroutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/testsubmissions', testRoutes);
app.use('/api/mcqquestion', mcqquestionRoutes);
app.use('/api/compiler', compilerRoutes);
app.use("/api", portfolioFeedback);
app.use("/gemini", geminiRoutes);
app.use("/api/feedback", feedbackRoutes);

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadDir}`);
});
