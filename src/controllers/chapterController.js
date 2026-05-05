import Chapter from "../models/chapterModel.js";
import Story from "../models/storyModel.js";

/**
 * Legends:
 *
 * (V) - Data Validation Blocks
 */

// Create Chapter Function
// No refactoring needed
export const createChapter = async (req, res) => {
  try {
    // Request Parameter: Story ID
    const { storyId } = req.params;

    // Request Body: Title, Content, and Parent ID
    const { title, content, parent_id } = req.body;

    // Request Session: User ID
    const author_id = req.session.userId;

    // (V) Null Checks: Title, Content, and StoryId
    if (!title || !content) {
      return res.status(400).json({ error: "title and content are required." });
    }
    if (!storyId || !content) {
      return res.status(400).json({ message: "Story ID is required" });
    }

    // (V) Story ID
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });

    // If parent ID is null - then assume that the chapter being written is a root chapter
    if (!parent_id) {
      // (V) Only the story's author can write the root chapter
      if (story.author_id !== author_id) {
        return res
          .status(403)
          .json({ error: "Only the story owner can write the root chapter." });
      }

      // (V) There should not be any existing root chapter
      const existingRoot = await Chapter.findRootByStoryId(storyId);
      if (existingRoot) {
        // If an existing root chapter exists, then return 409 response
        return res
          .status(409)
          .json({ error: "A root chapter already exists for this story." });
      }
    } else {
      // If parent ID is provided, then assume that this is a continuation or a branch -
      // TEAM: Search for the term "CB-R-1" in the Master Walkthrough Document

      // (V) The supplied parent ID must be a valid chapter
      const parent = await Chapter.findById(parent_id);
      if (!parent) {
        return res.status(404).json({ error: "Parent chapter not found." });
      }

      // (V) The parent chapter should belong to the same story as the chapter that is being writtened
      if (parent.story_id !== storyId) {
        return res
          .status(400)
          .json({ error: "Parent chapter does not belong to this story." });
      }
    }

    // Create new chapter from the data
    const newContribution = await Chapter.create({
      story_id: storyId,
      parent_id: parent_id || null, // Parent ID is null when it is a root chapter
      author_id: author_id,
      title,
      content,
    });

    // Send the new chapter to the frontend in JSON response
    res.status(201).json(newContribution);
  } catch (error) {
    console.error("createChapter error:", error);
    return res.status(500).json({ error: "Failed to create chapter." });
  }
};

// Fetch all the chapters for a given story
// Refactoring Needed
export const getChapters = async (req, res) => {
  try {
    // Request Parameter: Story ID
    const story = await Story.findById(req.params.storyId);

    // (V) Story ID must be valid
    if (!story) return res.status(404).json({ error: "Story not found." });

    // Fetch all the chapters belonging to the specific story ID
    const chapters = await Chapter.findByStoryId(req.params.storyId);

    // Send a JSON 200 Response with chapters array
    res.status(200).json(chapters);
  } catch (error) {
    console.error("getChapters error:", error);
    return res.status(500).json({ error: "Failed to fetch chapters." });
  }
};

// Get chapter tree for a given story ID
// Refactoring Needed
export const getTree = async (req, res) => {
  try {
    // Request Parameter: Story ID
    const story = await Story.findById(req.params.storyId);

    // (V) Story with that story ID must be present
    if (!story) return res.status(404).json({ error: "Story not found." });

    // Fetch the chapter tree with the story ID
    const tree = await Chapter.findTreeByStoryId(req.params.storyId);
    
    // Return the tree
    return res.json(tree);
  } catch (error) {
    console.error("getTree error: ", error);
    return res.status(500).json({ error: "Failed to fetch story tree." });
  }
};

// Fetch a specific chapter by the chapter ID
// Refactoring Needed
export const getChapter = async (req, res) => {
  try {
    // Request Parameter: Chapter ID
    const chapter = await Chapter.findById(req.params.id);
    
    // (V) Must be a valid chapter
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Return the chapter object
    res.status(200).json(chapter);
  } catch (error) {
    console.error("getChapter error:", error);
    return res.status(500).json({ error: "Failed to fetch chapter." });
  }
};

// Update the chapter by its ID
// Refactoring needed
export const updateChapter = async (req, res) => {
  try {
    // Request Body: title, content
    const { title, content } = req.body;

    // Request Parameters: id
    const { id } = req.params;

    // (V) Null Checks: Title and Content
    if (!title && !content) {
      return res
        .status(400)
        .json({ error: "Provide at least a title or content to update." });
    }

    // (V) The supplied chapter ID (to be edited) should be a valid an chapter
    const existing = await Chapter.findById(id);

    // (V) Chapter with that ID does not exist 
    // (V) OR the chapter belongs to some other story ID and not the story ID which is supplied
    if (!existing || existing.story_id !== req.params.storyId) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // (V) Only the chapter author can edit their chapters
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
