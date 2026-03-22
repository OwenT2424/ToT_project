// SERVER BLOCK -----
const Story = require("../models/storyModel");

exports.createStory = async (req, res) => {
  try {
    const { title } = req.body;
    // Assuming author_id comes from a decoded JWT or session in req.user
    const author_id = req.user.id; 

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newStory = await Story.create({ author_id, title });
    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ message: "Error creating story", error: error.message });
  }
};

exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.findAll();
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stories", error: error.message });
  }
};

exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: "Error fetching story", error: error.message });
  }
};