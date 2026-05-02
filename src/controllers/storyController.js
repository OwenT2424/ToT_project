import Story from "../models/storyModel.js";

/**
 * Legends:
 *
 * (V) - Data Validation Blocks
 */

// Create the story
// No refactoring needed
export const createStory = async (req, res) => {
  try {
    // Request body: title
    const { title } = req.body;

    // Request Session: User ID
    const author_id = req.session.userId;

    // (V) Null check: title
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Create story object with author ID and title
    const newStory = await Story.create({ author_id, title });
    // Return the newStory object as 201 and JSON
    res.status(201).json(newStory);
  } catch (error) {
    console.error("createStory error:", err);
    res
      .status(500)
      .json({ message: "Error creating story", error: error.message });
  }
};

// Get all stories (for the main page)
// No refactoring needed
export const getAllStories = async (req, res) => {
  try {
    // Fetch all
    const stories = await Story.findAll();
    // Return the stories array
    res.status(200).json(stories);
  } catch (error) {
    // catch any errors
    console.error("getAllStories error:", err);
    res
      .status(500)
      .json({ message: "Error fetching stories", error: error.message });
  }
};

// Get a specific story by its id
// Refactoring Needed
export const getStory = async (req, res) => {
  try {
    // Request Params: Story ID
    const story = await Story.findById(req.params.storyId);

    // (V) Story with the specified ID must exist
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Return 200 with the story object
    return res.status(200).json(story);
  } catch (error) {
    console.error("getStory error:", err);
    res
      .status(500)
      .json({ message: "Error fetching story", error: error.message });
  }
};
