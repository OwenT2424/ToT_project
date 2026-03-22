// Server Block -----
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const User = {
  async create({ username, email, password_hash }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Users (id, username, email, password_hash) VALUES (?,?,?,?)",
      [id, username, email, password_hash],
    );
    return { id, username, email };
  },
  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username],
    );
    return [rows] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, username, email, created_at FROM Users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },
};

// Server Block -----
export default User;
