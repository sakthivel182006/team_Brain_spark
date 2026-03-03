const Assessment = require("../models/Assessment");
const LearnerModel = require("../models/LearnerModel");
const Module = require("../models/Module");

exports.analyzeLearner = async (req, res) => {
  try {
    const { userId } = req.body;

    const assessments = await Assessment.find({ userId });

    let knowledgeMap = {};
    let weakAreas = [];
    let strongAreas = [];

    assessments.forEach(a => {
      knowledgeMap[a.conceptTag] = a.score / 100;

      if (a.score < 50) weakAreas.push(a.conceptTag);
      else strongAreas.push(a.conceptTag);
    });

    let recommendedModule = null;
    let reason = "";

    if (weakAreas.length > 0) {
      recommendedModule = await Module.findOne({ conceptTag: weakAreas[0] });
      reason = `Low performance detected in ${weakAreas[0]}`;
    }

    const learner = await LearnerModel.findOneAndUpdate(
      { userId },
      {
        knowledgeMap,
        weakAreas,
        strongAreas,
        recommendedNext: {
          moduleId: recommendedModule ? recommendedModule._id : null,
          reason
        }
      },
      { upsert: true, new: true }
    );

    res.json(learner);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};