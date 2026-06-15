const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const { upload } = require("../middlewares/file.middleware");
const interviewRouter = express.Router()

interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateUserInterviewReport);
interviewRouter.get("/history",authMiddleware.authUser,interviewController.getUserInterviewReportsHistory);

module.exports = interviewRouter 