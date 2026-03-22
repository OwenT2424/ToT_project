const Story = require("../models/storyModel");

exports.createStory = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required." });
  }

  try {
    const story = await Story.create({ author_id: req.session.userId, title });
    return res.status(201).json(story);
  } catch (err) {
    console.error("createStory error:", err);
    return res.status(500).json({ error: "Failed to create story." });
  }
};

exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.findAll();
    return res.json(stories);
  } catch (err) {
    console.error("getAllStories error:", err);
    return res.status(500).json({ error: "Failed to fetch stories." });
  }
};

exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: "Story not found." });
    return res.json(story);
  } catch (err) {
    console.error("getStory error:", err);
    return res.status(500).json({ error: "Failed to fetch story." });
  }
};