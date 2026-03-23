// OWEN

// SERVER BLOCK -----
import Story from "../models/storyModel.js";

// Create the story
export const createStory = async (req, res) => {
  try {
    const { title } = req.body;
    // author_id comes from session token in req.session.user
    const author_id = req.session.userId;

    // Validate if title is supplied
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Create story object
    const newStory = await Story.create({ author_id, title });
    res.status(201).json(newStory);
  } catch (error) {
    console.error("createStory error:", err);
    res
      .status(500)
      .json({ message: "Error creating story", error: error.message });
  }
};

// Get all stories
export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.findAll();
    res.status(200).json(stories);
  } catch (error) {
    console.error("getAllStories error:", err);
    res
      .status(500)
      .json({ message: "Error fetching stories", error: error.message });
  }
};

// Get a specific story
export const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    return res.status(200).json(story);
  } catch (error) {
    console.error("getStory error:", err);
    res
      .status(500)
      .json({ message: "Error fetching story", error: error.message });
  }
};
