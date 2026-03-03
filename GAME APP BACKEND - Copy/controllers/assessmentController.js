const Assessment = require("../models/Assessment");

exports.saveAssessment = async (req, res) => {
  try {
    const { userId, conceptTag, score, difficultyLevel, timeTaken } = req.body;

    const assessment = await Assessment.create({
      userId,
      conceptTag,
      score,
      difficultyLevel,
      timeTaken
    });

    res.status(201).json(assessment);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};