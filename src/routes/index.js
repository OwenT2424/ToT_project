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
    // Register
router.post("/auth/register", authController.register);
    // Login
router.post("/auth/login", authController.login);
    // Logout
router.post("/auth/logout", authController.logout);

// Stories Routes
    // Create a new story
router.post("/stories", requireAuth, storyController.createStory);  // Protected
    // Fetch all stories (home page)
router.get("/stories", storyController.getAllStories);
    // Fetch a specific story (read)
router.get("/stories/:id", storyController.getStory);

// Chapters Routes
    // Write a chapter for a story
router.post(
  "/stories/:storyId/chapters",
  requireAuth,
  chapterController.createChapter,
);          
    // Get all chapters of a story
router.get("/stories/:storyId/chapters", chapterController.getChapters);
    // Get a particular chapter of a story
router.get("/stories/:storyId/chapters/:id", chapterController.getChapter);
                                                        // Protected
    // Update a chapter for a story
router.put(
  "/stories/:storyId/chapters/:id",
  requireAuth,
  chapterController.updateChapter,
);                                                                  // Protected

// Server Block -----
export default router;
