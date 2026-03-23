// OWEN

// SERVER BLOCK -----
import Chapter from "../models/chapterModel.js";
import Story from "../models/storyModel.js";

// Create Chapter Function
export const createChapter = async (req, res) => {
  try {
    // Extract Story ID from request parameters
    const { storyId } = req.params;
    const { title, content, parent_id } = req.body;
    const author_id = req.session.userId; // User ID from Session Token

    // Validate if proper parameter exist
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required." });
    }

    if (!storyId || !content) {
      return res.status(400).json({ message: "Story ID is required" });
    }

    // Check if the story exists (malicious request can be sent with an invalid story ID for a valid chapter ID)
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    // Check if parent ID exists
    if (!parent_id) {
      // This executes if parent ID does not exist, i.e., Root Chapter
      // Validate user ID: only the story owner can create it
      if (story.author_id !== author_id) {
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

    // Create a chapter object's instance
    const newContribution = await Chapter.create({
      story_id: storyId,
      parent_id: parent_id || null,
      author_id: author_id,
      title,
      content,
    });

    res.status(201).json(newContribution);
  } catch (error) {
    console.error("createChapter error:", error);
    return res.status(500).json({ error: "Failed to create chapter." });
  }
};

// Fetch all chapters
export const getChapters = async (req, res) => {
  try {
    // Fetches all chapters for a specific story
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    const chapters = await Chapter.findByStoryId(req.params.storyId);
    res.status(200).json(chapters);
  } catch (error) {
    console.error("getChapters error:", error);
    return res.status(500).json({ error: "Failed to fetch chapters." });
  }
};

// Fetch a specific chapter
export const getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    console.error("getChapter error:", error);
    return res.status(500).json({ error: "Failed to fetch chapter." });
  }
};

// Update the chapter
export const updateChapter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;

    if (!title && !content) {
      return res
        .status(400)
        .json({ error: "Provide at least a title or content to update." });
    }

    // Check if the supplied chapter ID exists first
    const existing = await Chapter.findById(id);
    if (!existing || existing.story_id !== req.params.storyId) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Validate to ensure only the owner edits
    if (existing.author_id !== req.session.userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own chapters." });
    }

    // Update the chapter and return the updated content(s)
    await Chapter.update(id, { title, content });
    const updated = await Chapter.findById(req.params.id);
    return res.json(updated);
  } catch (error) {
    console.error("updateChapter error:", error);
    return res.status(500).json({ error: "Failed to update chapter." });
  }
};
