import bcrypt from "bcrypt";
import User from "../models/userModel.js";

/**
 * Legends:
 *
 * (V) - Data Validation Blocks
 */

const SALT_ROUNDS = 10;

// Registration Function
// No refactoring needed
export const register = async (req, res) => {
  // Request Body: username, email, password
  const { username, email, password } = req.body;

  // (V) Null checks: username, email, password
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, Email, and Password are required." });
  }

  try {
    // (V) User with the same email must not register twice
    const existing_email = await User.findByEmail(email);
    if (existing_email) {
      return res.status(409).json({ error: "Email already in use." });
    }

    // (V) User with the same username cannot register
    const existing_username = await User.findByUsername(username);
    if (existing_username) {
      return res.status(409).json({ error: "Username already in use." });
    }

    // Compute the password hash
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the new user and store the returned user object in a "user" constant variable
    const user = await User.create({ username, email, password_hash });

    // Append user object's id to the request's session
    req.session.userId = user.id;

    // Return 201 Response with user ID
    return res
      .status(201)
      .json({ message: "Registered successfully!", userId: user.id });
  } catch (err) {
    console.error("Registration Error: ", err);
    return res.status(500).json({ error: "Registration failed." });
  }
};

// Login Function
// No refactoring needed
export const login = async (req, res) => {
  // Request Body: Email, Password
  const { email, password } = req.body;

  // (V) Null checks: Email and Password
  if (!email || !password) {
    return res.status(400).json({ error: "Email and Password are required." });
  }

  try {

    // (V) user with the supplied email must exist
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // (V) Compare the password hashes - Returns True (match) and False (doesn't)
    const match = await bcrypt.compare(password, user.password_hash);
    // If false, return a response
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Append the object's user id to the session token
    req.session.userId = user.id;
    // Return 201 Response with user ID
    return res.json({ message: "Logged in successfully.", userId: user.id });
  } catch (err) {
    // Catch any error and gracefully terminate
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed." });
  }
};

// Logout function
// No refactoring needed
export const logout = (req, res) => {
  // Destroy session cookie
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully." });
  });
};
