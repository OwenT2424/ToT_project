const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are required." });
  }

  try {
    const existing_email = await User.findByEmail(email);
    if (existing_email) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const existing_username = await User.findByUsername(username);
    if (existing_username) {
      return res.status(409).json({ error: "Username already in use." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, password_hash });

    req.session.userId = user.id;
    return res
      .status(201)
      .json({ message: "Registered successfully!", userId: user.id });
  } catch (err) {
    console.error("Registration Error: ", err);
    return res.status(500).json({ error: "Registration failed." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    req.session.userId = user.id;
    return res.json({ message: "Logged in successfully.", userId: user.id });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully." });
  });
};
