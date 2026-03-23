// TEJAS

import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const SALT_ROUNDS = 10;

// Registration Function
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Return if username, email or password is missing
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, Email, and Password are required." });
  }

  try {
    // Check for an existing account by email
    const existing_email = await User.findByEmail(email);
    if (existing_email) {
      return res.status(409).json({ error: "Email already in use." });
    }

    // Check for an existing account by username
    const existing_username = await User.findByUsername(username);
    if (existing_username) {
      return res.status(409).json({ error: "Username already in use." });
    }

    // Hash the password and create the User object
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, password_hash });

    // Append the object's user id to the session token & Return user ID
    req.session.userId = user.id;
    return res
      .status(201)
      .json({ message: "Registered successfully!", userId: user.id });
  } catch (err) {
    console.error("Registration Error: ", err);
    return res.status(500).json({ error: "Registration failed." });
  }
};

// Login Function
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are sent.
  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required." });
  }

  try {
    // Check if user exists in the database by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Validate the password hashes
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Append the object's user id to the session token & Return user ID
    req.session.userId = user.id;
    return res.json({ message: "Logged in successfully.", userId: user.id });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed." });
  }
};

// Logout function
export const logout = (req, res) => {
  // Destroy session cookie
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully." });
  });
};
