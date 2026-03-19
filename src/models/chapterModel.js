// Server Block ------
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Chapter = {
    async create({ story_id, parent_id, author_id, title, content }) {
    const id = uuidv4();
    await pool.execute("INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content) VALUES (?, ?, ?, ?, ?, ?)", [id, story_id, parent_id, author_id, title, content]);
    return { id, story_id, parent_id, author_id, title, content };
  },

  async findRootByStoryId(storyId) {
    const [rows] = await pool.execute("SELECT * FROM Chapters WHERE story_id = ? AND parent_id IS NULL", [storyId]);
    return rows[0] || null;
  },

  async findByStoryId(storyId) {
    const [rows] = await pool.execute("SELECT * FROM Chapters WHERE story_id = ?", [storyId]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Chapters WHERE id = ?", [id]);
    return rows[0] || null;
  },
  async update(id, { title, content }){
    values = [title, content, id];
    await pool.execute("UPDATE chapters set title = ?, content = ? where id = ?", values);
  }
};

// Server Block ------
module.exports = Chapter;
