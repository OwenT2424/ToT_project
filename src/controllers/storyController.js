// SERVER BLOCK -----
import Story from "../models/storyModel.js";

export const createStory = async (req, res) => {
  try {
    const { title } = req.body;
    // Assuming author_id comes from a decoded JWT or session in req.user
    const author_id = req.session.userId;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newStory = await Story.create({ author_id, title });
    res.status(201).json(newStory);
  } catch (error) {
    console.error("createStory error:", err);
    res
      .status(500)
      .json({ message: "Error creating story", error: error.message });
  }
};

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
