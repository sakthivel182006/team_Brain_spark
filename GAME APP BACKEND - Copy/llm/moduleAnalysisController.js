const fetch = require("node-fetch");
const ModuleAIAnalysis = require("../models/ModuleAIAnalysis");

exports.analyzeModule = async (req, res) => {
  try {

    const { courseName, moduleName, feedbackText } = req.body;

    const prompt = `
Course: ${courseName}
Module: ${moduleName}

Student Feedback:
${feedbackText}

Analyze overall sentiment, strengths, complaints,
difficulty suitability, improvement suggestions,
and give final health score out of 100.
`;

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          messages: [
            { role: "system", content: "You are an educational AI analyst." },
            { role: "user", content: prompt }
          ],
          temperature: 0.4,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || "No response";

    // Extract health score (basic regex)
    const scoreMatch = reply.match(/(\d{1,3})\/100/);
    const healthScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

    res.json({
      success: true,
      aiResult: reply,
      healthScore
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.saveAnalysis = async (req, res) => {
  try {

    const { courseId, moduleId, teacherId, aiResult, healthScore } = req.body;

    const analysis = new ModuleAIAnalysis({
      courseId,
      moduleId,
      teacherId,
      aiResult,
      healthScore
    });

    await analysis.save();

    res.json({ success: true, message: "AI Analysis Saved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTeacherAnalyses = async (req, res) => {
  try {

    const { teacherId } = req.params;

    const analyses = await ModuleAIAnalysis
      .find({ teacherId })
      .populate("courseId", "title")
      .populate("moduleId", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: analyses.length,
      analyses
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};