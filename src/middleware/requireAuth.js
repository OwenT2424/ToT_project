// Middleware to validate session token's existence and user Id's existence within the session token for protected routes
// This middleware serves the backend

export default function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  next(); // Follow the next function
}
