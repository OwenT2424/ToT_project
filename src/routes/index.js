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
router.post("/stories", (req, res) => {
  res.json({ message: "TODO" });
});

router.get("/stories", (req, res) => {
  res.json({ message: "TODO" });
});

router.get("/stories/:storyId", (req, res) => {
  res.json({ message: "TODO" });
});

// chapters route can go below

router.get("/stories/:storyId/chapters", (req, res) => {
  res.json({ message: "TODO" });
});

router.get("/stories/:storyId/chapters/:chapterId", (req, res) => {
  res.json({ message: "TODO" });
});

router.post("/stories/:storyId/chapters", (req, res) => {
  res.json({ message: "TODO" });
});

router.post("/stories/:storyId/chapters/:chapterId", (req, res) => {
  res.json({ message: "TODO" });
});

// Server Block -----
module.exports = router;