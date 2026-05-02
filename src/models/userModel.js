import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

// User Model Object
const User = {

  // Create the user (registration)
  async create({ username, email, password_hash }) {
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO Users (id, username, email, password_hash) VALUES (?,?,?,?)",
      [id, username, email, password_hash],
    );
    return { id, username, email };
  },

  // Find a user by email (used for validation during registration and login)
  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  // Find a user by username (used for validation during registration)
  async findByUsername(username) {
    const [rows] = await pool.execute(
      "SELECT * FROM Users WHERE username = ?",
      [username],
    );
    return rows[0] || null;
  },

  // Find a user by user ID (used for validation during certain operations where the session token is compared against the user ID)
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, username, email, created_at FROM Users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },
};

export default User;
