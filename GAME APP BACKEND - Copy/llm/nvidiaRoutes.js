const express = require("express");
const router = express.Router();
const { generateResponse } = require("./nvidiaController");

router.post("/generate", generateResponse);

module.exports = router;