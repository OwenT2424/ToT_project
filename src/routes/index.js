// Server Block -----
const express = require("express");
const router = express.Router();
const { healthCheck } = require("../controllers/healthController");
router.get("/health", healthCheck);

// API Routing Block -> ZAYNAH -----

// auth routes can go below

// stories route can go below

// chapters route can go below

// Server Block -----
module.exports = router;