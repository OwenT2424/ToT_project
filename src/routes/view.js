// src/routes/view.js
// These routes render Pug templates for browser navigation.
// They sit alongside the /api routes and share the same session.

import express from "express";
const router = express.Router();
import Story from "../models/storyModel.js";
import Chapter from "../models/chapterModel.js";

// Function to validate session token and user-id's existence
// Redirect to login page if invalid
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) return res.redirect("/auth/login");
  next();
}

// Authentication Views
router.get("/auth/login", (req, res) => {
  if (req.session.userId) return res.redirect("/stories");
  res.render("auth/login", { title: "Sign in" });
});

router.get("/auth/register", (req, res) => {
  if (req.session.userId) return res.redirect("/stories");
  res.render("auth/register", { title: "Join" });
});

// ── Story views ──────────────────────────────────────────────
router.get("/stories", async (req, res) => {
  const stories = await Story.findAll();
  res.render("stories/index", {
    title: "Stories",
    stories,
    user: req.session.userId || null,
  });
});

router.get("/stories/new", requireAuth, (req, res) => {
  res.render("stories/new", {
    title: "New Story",
    user: req.session.userId,
  });
});

router.get("/stories/:storyId", async (req, res) => {
  const story = await Story.findById(req.params.storyId);
  if (!story) return res.status(404).send("Story not found");

  const chapters = await Chapter.findByStoryId(req.params.storyId);
  res.render("stories/show", {
    title: story.title,
    story,
    chapters,
    user: req.session.userId || null,
  });
});

// ── Chapter views ────────────────────────────────────────────
router.get("/stories/:storyId/chapters/new", requireAuth, async (req, res) => {
  const story = await Story.findById(req.params.storyId);
  if (!story) return res.status(404).send("Story not found");

  // Find the last chapter to set as parent_id
  const chapters = await Chapter.findByStoryId(req.params.storyId);
  const lastChapter = chapters.length ? chapters[chapters.length - 1] : null;

  res.render("chapters/form", {
    title: "Write a Chapter",
    story,
    chapter: null,
    parentId: lastChapter ? lastChapter.id : null,
    user: req.session.userId,
  });
});

router.get("/stories/:storyId/chapters/:chapterId", async (req, res) => {
  const story = await Story.findById(req.params.storyId);
  if (!story) return res.status(404).send("Story not found");

  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter || chapter.story_id !== req.params.storyId) {
    return res.status(404).send("Chapter not found");
  }

  const chapters = await Chapter.findByStoryId(req.params.storyId);
  const idx = chapters.findIndex((c) => c.id === chapter.id);

  res.render("chapters/show", {
    title: chapter.title,
    story,
    chapter,
    chapterIndex: idx,
    prevChapter: idx > 0 ? chapters[idx - 1] : null,
    nextChapter: idx < chapters.length - 1 ? chapters[idx + 1] : null,
    user: req.session.userId || null,
  });
});

router.get(
  "/stories/:storyId/chapters/:chapterId/edit",
  requireAuth,
  async (req, res) => {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).send("Story not found");

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter || chapter.story_id !== req.params.storyId) {
      return res.status(404).send("Chapter not found");
    }

    if (chapter.author_id !== req.session.userId) {
      return res.status(403).send("You can only edit your own chapters.");
    }

    res.render("chapters/form", {
      title: `Edit — ${chapter.title}`,
      story,
      chapter,
      parentId: null,
      user: req.session.userId,
    });
  },
);

// ── Root redirect ────────────────────────────────────────────
router.get("/", (req, res) => res.redirect("/stories"));

export default router;
