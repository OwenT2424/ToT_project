const Chapter = require("../models/chapterModel");
const Story = require("../models/storyModel");

exports.createChapter = async (req, res) => {
  const { storyId } = req.params;
  const { title, content, parent_id } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required." });
  }

  try {
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    if (!parent_id) {
      // Root chapter: only the story owner can create it
      if (story.author_id !== req.session.userId) {
        return res
          .status(403)
          .json({ error: "Only the story owner can write the root chapter." });
      }
      // Enforce only one root chapter per story
      const existingRoot = await Chapter.findRootByStoryId(storyId);
      if (existingRoot) {
        return res
          .status(409)
          .json({ error: "A root chapter already exists for this story." });
      }
    } else {
      // Branch: validate parent exists and belongs to this story
      const parent = await Chapter.findById(parent_id);
      if (!parent)
        return res.status(404).json({ error: "Parent chapter not found." });
      if (parent.story_id !== storyId) {
        return res
          .status(400)
          .json({ error: "Parent chapter does not belong to this story." });
      }
    }

    // story_id always comes from the URL param — never trust the client body
    const chapter = await Chapter.create({
      story_id: storyId,
      parent_id: parent_id || null,
      author_id: req.session.userId,
      title,
      content,
    });

    return res.status(201).json(chapter);
  } catch (err) {
    console.error("createChapter error:", err);
    return res.status(500).json({ error: "Failed to create chapter." });
  }
};

exports.getChapters = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    const chapters = await Chapter.findByStoryId(req.params.storyId);
    return res.json(chapters);
  } catch (err) {
    console.error("getChapters error:", err);
    return res.status(500).json({ error: "Failed to fetch chapters." });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter || chapter.story_id !== req.params.storyId) {
      return res.status(404).json({ error: "Chapter not found." });
    }
    return res.json(chapter);
  } catch (err) {
    console.error("getChapter error:", err);
    return res.status(500).json({ error: "Failed to fetch chapter." });
  }
};

exports.updateChapter = async (req, res) => {
  const { title, content } = req.body;

  if (!title && !content) {
    return res
      .status(400)
      .json({ error: "Provide at least a title or content to update." });
  }

  try {
    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter || chapter.story_id !== req.params.storyId) {
      return res.status(404).json({ error: "Chapter not found." });
    }

    // Only the chapter's author can edit it
    if (chapter.author_id !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own chapters." });
    }

    await Chapter.update(req.params.chapterId, { title, content });
    const updated = await Chapter.findById(req.params.chapterId);
    return res.json(updated);
  } catch (err) {
    console.error("updateChapter error:", err);
    return res.status(500).json({ error: "Failed to update chapter." });
  }
};