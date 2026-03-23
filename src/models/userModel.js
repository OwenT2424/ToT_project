// KRIS

// Server Block -----
import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// User Model Object
const User = {

  // Create the user
  async create({ username, email, password_hash }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Users (id, username, email, password_hash) VALUES (?,?,?,?)",
      [id, username, email, password_hash],
    );
    return { id, username, email };
  },

  // Find a user by email
  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  // Find a user by username
  async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username],
    );
    return rows[0] || null;
  },

  // Find a user by user ID
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
