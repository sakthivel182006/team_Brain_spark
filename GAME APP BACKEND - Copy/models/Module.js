const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title: { type: String, required: true },
    conceptTag: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5 },
    videoUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Module", ModuleSchema);