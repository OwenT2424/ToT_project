import app from "./app.js";
import pool from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer(retries = 5, delay = 3000) {
  try {
    await pool.query("SELECT 1"); // probe the DB
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    if (retries === 0) {
      console.error("Could not connect to DB. Exiting.");
      process.exit(1);
    }
    console.log(
      `DB not ready. Retrying in ${delay / 1000}s... (${retries} attempts left)`,
    );
    setTimeout(() => startServer(retries - 1, delay), delay);
  }
}

startServer();
