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
  if (!req.session || !req.session.userId) {
    req.flash("You need to be signed in to do that.");
    return res.redirect("/auth/login");
  }
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

// Story
router.get("/stories", async (req, res, next) => {
  try {
    const stories = await Story.findAll();
    res.render("stories/index", {
      title: "Stories",
      stories,
      user: req.session.userId || null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/stories/new", requireAuth, (req, res) => {
  res.render("stories/new", {
    title: "New Story",
    user: req.session.userId,
  });
});

router.get("/stories/:storyId", async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story)
      return res.status(404).render("error", {
        status: 404,
        title: "Story not found.",
        message: "That story doesn't exist or may have been removed.",
      });

    const chapters = await Chapter.findByStoryId(req.params.storyId);
    res.render("stories/show", {
      title: story.title,
      story,
      chapters,
      user: req.session.userId || null,
    });
  } catch (err) {
    next(err);
  }
});

// Chapter views
router.get("/stories/:storyId/chapters/new", requireAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story)
      return res.status(404).render("error", {
        status: 404,
        title: "Story not found.",
        message: "That story doesn't exist.",
      });

    const chapters = await Chapter.findByStoryId(req.params.storyId);
    const lastChapter = chapters.length ? chapters[chapters.length - 1] : null;

    res.render("chapters/form", {
      title: "Write a Chapter",
      story,
      chapter: null,
      parentId: lastChapter ? lastChapter.id : null,
      user: req.session.userId,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/stories/:storyId/chapters/:chapterId", async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story)
      return res.status(404).render("error", {
        status: 404,
        title: "Story not found.",
        message: "That story doesn't exist.",
      });

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter || chapter.story_id !== req.params.storyId) {
      return res.status(404).render("error", {
        status: 404,
        title: "Chapter not found.",
        message: "That chapter doesn't exist.",
      });
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
  } catch (err) {
    next(err);
  }
});

router.get(
  "/stories/:storyId/chapters/:chapterId/edit",
  requireAuth,
  async (req, res) => {
    try {
      const story = await Story.findById(req.params.storyId);
      if (!story)
        return res
          .status(404)
          .render("error", {
            status: 404,
            title: "Story not found.",
            message: "That story doesn't exist.",
          });

      const chapter = await Chapter.findById(req.params.chapterId);
      if (!chapter || chapter.story_id !== req.params.storyId) {
        return res
          .status(404)
          .render("error", {
            status: 404,
            title: "Chapter not found.",
            message: "That chapter doesn't exist.",
          });
      }

      if (chapter.author_id !== req.session.userId) {
        return res
          .status(403)
          .render("error", {
            status: 403,
            title: "Not allowed.",
            message: "You can only edit your own chapters.",
          });
      }

      res.render("chapters/form", {
        title: `Edit — ${chapter.title}`,
        story,
        chapter,
        parentId: null,
        user: req.session.userId,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Root redirect
router.get("/", (req, res) => res.redirect("/stories"));

export default router;
