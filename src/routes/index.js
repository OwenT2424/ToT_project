// ZAYNAH, OWEN & TEJAS
// ZAYNAH - initialize the routes.
// OWEN   - Append the suitable controllers for routes
// TEJAS  - Project the routes

// Server Block -----
import express from "express";
const router = express.Router();
import { healthCheck } from "../controllers/healthController.js";
import * as authController from "../controllers/authController.js";
import * as storyController from "../controllers/storyController.js";
import * as chapterController from "../controllers/chapterController.js";
import requireAuth from "../middleware/requireAuth.js";

router.get("/health", healthCheck);

// Authentication Routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// Stories Routes
router.post("/stories", requireAuth, storyController.createStory);  // Protected
router.get("/stories", storyController.getAllStories);
router.get("/stories/:id", storyController.getStory);

// Chapters Routes
router.get("/stories/:storyId/chapters", chapterController.getChapters);
router.get("/stories/:storyId/chapters/:id", chapterController.getChapter);
router.post(
  "/stories/:storyId/chapters",
  requireAuth,
  chapterController.createChapter,
);                                                                  // Protected
router.put(
  "/stories/:storyId/chapters/:id",
  requireAuth,
  chapterController.updateChapter,
);                                                                  // Protected

// Server Block -----
export default router;
