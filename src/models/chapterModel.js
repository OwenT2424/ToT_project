import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Chapter Model Object
const Chapter = {
  // Create a chapter function
  async create({ story_id, parent_id = null, author_id, title, content }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content) VALUES (?, ?, ?, ?, ?, ?)",
      [id, story_id, parent_id, author_id, title, content],
    );
    return { id, story_id, parent_id, author_id, title, content };
  },

  // Find Root Chapter By story ID
  async findRootByStoryId(storyId) {
    const [rows] = await pool.execute(
      "SELECT * FROM Chapters WHERE story_id = ? AND parent_id IS NULL",
      [storyId],
    );
    return rows[0] || null;
  },

  // Find all chapters for a specific story ID
  async findByStoryId(storyId) {
    const [rows] = await pool.execute(
      `
      SELECT c.id, c.story_id, c.parent_id, c.title, c.content, c.created_at,
             u.id AS author_id, u.username AS author_username
      FROM Chapters c
      JOIN Users u ON c.author_id = u.id
      WHERE c.story_id = ?
      ORDER BY c.created_at ASC, c.id ASC
    `,
      [storyId],
    );
    return rows;
  },

  // Find a specific chapter by chapter ID
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

  // Update a specific chapter by Chapter ID
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

  // S4-Block
  // Find a story's chapter tree - Similar to find all chapters but orders by id and creation time
  async findTreeByStoryId(story_id) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.parent_id, c.title, c.created_at, 
              u.username AS author_username 
        FROM Chapters c 
        JOIN Users u on c.author_id = u.id 
        WHERE c.story_id = ? 
        ORDER BY c.created_at ASC, c.id ASC`,
      [story_id],
    );
    return rows;
  },

  // Find all the children (those chapters which have a parent ID of the current one) of a particular chapter by its ID
  async findChildren(parent_id) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.story_id, c.parent_id, c.title, c.created_at, 
              u.username AS author_username 
      FROM Chapters c
      JOIN Users u ON c.author_id = u.id
      WHERE c.parent_id = ?
      ORDER BY c.created_at ASC, c.id ASC`,
      [parent_id],
    );
    return rows;
  },
  // S4-Block Over
};

export default Chapter;
