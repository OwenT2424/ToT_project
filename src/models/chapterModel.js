// Server Block ------
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const Chapter = {
  async create({ story_id, parent_id = null, author_id, title, content }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content) VALUES (?, ?, ?, ?, ?, ?)",
      [id, story_id, parent_id, author_id, title, content],
    );
    return { id, story_id, parent_id, author_id, title, content };
  },

  async findRootByStoryId(storyId) {
    const [rows] = await pool.execute(
      "SELECT * FROM Chapters WHERE story_id = ? AND parent_id IS NULL",
      [storyId],
    );
    return rows[0] || null;
  },

  async findByStoryId(storyId) {
    const [rows] = await pool.execute(
      `
      SELECT c.id, c.story_id, c.parent_id, c.title, c.content, c.created_at,
             u.id AS author_id, u.username AS author_username
      FROM Chapters c
      JOIN Users u ON c.author_id = u.id
      WHERE c.story_id = ?
      ORDER BY c.created_at ASC
    `,
      [storyId],
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT c.id, c.story_id, c.parent_id, c.title, c.content, c.created_at,
             u.id AS author_id, u.username AS author_username
      FROM Chapters c
      JOIN Users u ON c.author_id = u.id
      WHERE c.id = ?
    `,
      [id],
    );
    return rows[0] || null;
  },

  async update(id, { title, content }) {
    const fields = [];
    const values = [];

    if (title) {
      fields.push("title = ?");
      values.push(title);
    }
    if (content) {
      fields.push("content = ?");
      values.push(content);
    }

    values.push(id);
    await pool.execute(
      `UPDATE Chapters SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  },
};

// Server Block ------
export default Chapter;
