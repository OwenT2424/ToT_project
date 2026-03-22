// SERVER BLOCK -----
import Chapter from "../models/chapterModel.js";
import Story from "../models/storyModel.js";

export const createChapter = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title, content, parent_id } = req.body;
    const author_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required." });
    }

    if (!storyId || !content) {
      return res.status(400).json({ message: "Story ID is required" });
    }

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

    const newContribution = await Chapter.create({
      story_id: storyId,
      parent_id: parent_id || null,
      author_id: req.session.userId,
      title,
      content,
    });

    res.status(201).json(newContribution);
  } catch (error) {
    console.error("createChapter error:", err);
    return res.status(500).json({ error: "Failed to create chapter." });
  }
};

export const getChapters = async (req, res) => {
  try {
    // Fetches all sentences/chapters for a specific story
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    const chapters = await Chapter.findByStoryId(req.params.storyId);
    res.status(200).json(chapters);
  } catch (error) {
    console.error("getChapters error:", err);
    return res.status(500).json({ error: "Failed to fetch chapters." });
  }
};

export const getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    console.error("getChapter error:", err);
    return res.status(500).json({ error: "Failed to fetch chapter." });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;

    if (!title && !content) {
      return res
        .status(400)
        .json({ error: "Provide at least a title or content to update." });
    }

    // Check if it exists first
    const existing = await Chapter.findById(id);
    if (!existing || existing.story_id !== req.params.storyId) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Check if req.user.id === existing.author_id to ensure only the owner edits
    if (existing.author_id !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own chapters." });
    }

    await Chapter.update(id, { title, content });
    const updated = await Chapter.findById(req.params.chapterId);
    return res.json(updated);
  } catch (error) {
    console.error("updateChapter error:", err);
    return res.status(500).json({ error: "Failed to update chapter." });
  }
};
