// Server Block -----
const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthController");
router.get("/health", healthCheck);

// API Routing Block -> ZAYNAH -----

// auth routes can go below

router.post("/auth/register", (req, res) => {
  res.json({ message: "TODO" });
});

router.post("/auth/login", (req, res) => {
  res.json({ message: "TODO" });
});

router.post("/auth/logout", (req, res) => {
  res.json({ message: "TODO" });
});

// stories route can go below
router.post("/stories", requireAuth, storyController.createStory);

router.get("/stories", storyController.getAllStories);

router.get("/stories/:id", storyController.getStory);

// chapters route can go below

// Get all sentences for a specific story
router.get("/stories/:storyId/chapters", chapterController.getChapters);

// Get a specific sentence/chapter by its ID
router.get("/stories/:storyId/chapters/:id", chapterController.getChapter);

// Create a new sentence (Contribution) for a story
router.post("/stories/:storyId/chapters", requireAuth, chapterController.createChapter);

// Update a specific sentence (if the user is the author)
router.post("/stories/:storyId/chapters/:id", requireAuth, chapterController.updateChapter);

// Server Block -----
module.exports = router;