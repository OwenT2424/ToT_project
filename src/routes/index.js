// Server Block -----
const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthController");
const authController = require("../controllers/authController");
const storyController = require("../controllers/storyController");
const chapterController = require("../controllers/chapterController");
const requireAuth = require("../middleware/requireAuth");

router.get("/health", healthCheck);

// Authentication Routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// Stories Routes
router.post("/stories", requireAuth, storyController.createStory);
router.get("/stories", storyController.getAllStories);
router.get("/stories/:id", storyController.getStory);

// Chapters Routes
router.get("/stories/:storyId/chapters", chapterController.getChapters);
router.get("/stories/:storyId/chapters/:id", chapterController.getChapter);
router.post(
  "/stories/:storyId/chapters",
  requireAuth,
  chapterController.createChapter,
);
router.post(
  "/stories/:storyId/chapters/:id",
  requireAuth,
  chapterController.updateChapter,
);

// Server Block -----
module.exports = router;
