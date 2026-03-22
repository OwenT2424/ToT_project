// Server Block ------
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const Story = {
  async create({ author_id, title }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Stories (id, author_id, title) VALUES (?,?,?)",
      [id, author_id, title],
    );
    return { id, author_id, title };
  },

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

// Server Block ------
module.exports = Story;
