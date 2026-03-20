// SERVER BLOCK -----
const Chapter = require("../models/chapterModel");
const Story = require("../models/storyModel");

exports.createChapter = async (req, res) => {
  try {
    const { story_id, parent_id, title, content } = req.body;
    const author_id = req.user.id;

    if (!story_id || !content) {
      return res.status(400).json({ message: "Story ID and content are required" });
    }

    const newContribution = await Chapter.create({ 
      story_id, 
      parent_id, // null if it's the very first sentence
      author_id, 
      title, 
      content 
    });

    res.status(201).json(newContribution);
  } catch (error) {
    res.status(500).json({ message: "Error adding contribution", error: error.message });
  }
};

exports.getChapters = async (req, res) => {
  try {
    // Fetches all sentences/chapters for a specific story
    const chapters = await Chapter.findByStoryId(req.params.storyId);
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contributions", error: error.message });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Contribution not found" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contribution", error: error.message });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;

    // Check if it exists first
    const existing = await Chapter.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // Optional: Check if req.user.id === existing.author_id to ensure only the owner edits
    await Chapter.update(id, { title, content });
    res.status(200).json({ message: "Contribution updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating contribution", error: error.message });
  }
};