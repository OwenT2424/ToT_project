import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// Story Model Object
const Story = {

  // Create a story function
  async create({ author_id, title }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Stories (id, author_id, title) VALUES (?,?,?)",
      [id, author_id, title],
    );
    return { id, author_id, title };
  },

  // Find all stories
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT s.id, s.title, s.created_at,
             u.id AS author_id, u.username AS author_username
      FROM Stories s
      JOIN Users u ON s.author_id = u.id
      ORDER BY s.created_at DESC
    `);
    return rows;
  },

  // Find a specific story by story ID 
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT s.id, s.title, s.created_at,
             u.id AS author_id, u.username AS author_username
      FROM Stories s
      JOIN Users u ON s.author_id = u.id
      WHERE s.id = ?
    `,
      [id],
    );
    return rows[0] || null;
  },
};

export default Story;
