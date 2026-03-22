const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthController");
const authController = require("../controllers/authController");
const storyController = require("../controllers/storyController");
const chapterController = require("../controllers/chapterController");
const requireAuth = require("../middleware/requireAuth");

router.get("/health", healthCheck);

// auth routes can go here
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// stories route can go here
router.post("/stories", requireAuth, storyController.createStory);
router.get("/stories", storyController.getAllStories);
router.get("/stories/:storyId", storyController.getStory);

// chapters route can go here
router.get("/stories/:storyId/chapters", chapterController.getChapters);
router.get(
  "/stories/:storyId/chapters/:chapterId",
  chapterController.getChapter,
);
router.post(
  "/stories/:storyId/chapters",
  requireAuth,
  chapterController.createChapter,
);
router.post(
  "/stories/:storyId/chapters/:chapterId",
  requireAuth,
  chapterController.updateChapter,
);

module.exports = router;
