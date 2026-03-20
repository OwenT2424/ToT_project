// Run with: node src/seeders/seed.js
require("dotenv").config();

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const SALT_ROUNDS = 10;

async function seed() {
  try {
    console.log("Starting seed...\n");

    // Clear existing data (order matters due to foreign keys)
    await pool.execute("DELETE FROM Chapters");
    await pool.execute("DELETE FROM Stories");
    await pool.execute("DELETE FROM Users");
    console.log("[+] Cleared existing data.");

    // --- 1. Create 4 Users ---
    const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

    const alice = {
      id: uuidv4(),
      username: "alice",
      email: "alice@example.com",
    };
    const bob = { id: uuidv4(), username: "bob", email: "bob@example.com" };
    const carol = {
      id: uuidv4(),
      username: "carol",
      email: "carol@example.com",
    };
    const dave = { id: uuidv4(), username: "dave", email: "dave@example.com" };

    for (const user of [alice, bob, carol, dave]) {
      await pool.execute(
        "INSERT INTO Users (id, username, email, password_hash) VALUES (?, ?, ?, ?)",
        [user.id, user.username, user.email, passwordHash],
      );
    }
    console.log(
      "[+] 4 users created (alice, bob, carol, dave). Password: password123",
    );

    // --- 2. Create 1 Story (owned by alice) ---
    const storyId = uuidv4();
    await pool.execute(
      "INSERT INTO Stories (id, author_id, title) VALUES (?, ?, ?)",
      [storyId, alice.id, "The Lost Signal"],
    );
    console.log(`[+] Story created: "The Lost Signal" (id: ${storyId})`);

    // --- 3. Root Chapter (alice, parent_id = NULL) ---
    const ch1Id = uuidv4();
    await pool.execute(
      "INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content) VALUES (?, ?, ?, ?, ?, ?)",
      [
        ch1Id,
        storyId,
        null,
        alice.id,
        "A Strange Frequency",
        `Alice sat alone in the radio shack, headphones pressed tight against her ears.
The static had been going on for six hours straight — until, just after midnight, it stopped.
In its place came something else: a voice, low and rhythmic, counting backwards from one hundred
in a language she almost recognized.`,
      ],
    );
    console.log("[+] Chapter 1 created (root, author: alice).");

    // --- 4. Chapter 2 (bob continues) ---
    const ch2Id = uuidv4();
    await pool.execute(
      "INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content) VALUES (?, ?, ?, ?, ?, ?)",
      [
        ch2Id,
        storyId,
        ch1Id,
        bob.id,
        "The Source",
        `Bob had warned her about Station Null — the frequency that wasn't supposed to exist.
He arrived at her door before dawn, a battered notebook tucked under his arm.
"I've heard it before," he said, spreading hand-drawn maps across her desk.
"It's not a broadcast. It's a beacon. And it's very close."`,
      ],
    );
    console.log("[+] Chapter 2 created (author: bob).");

    // --- 5. Chapter 3 (carol continues) ---
    const ch3Id = uuidv4();
    await pool.execute(
      "INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content) VALUES (?, ?, ?, ?, ?, ?)",
      [
        ch3Id,
        storyId,
        ch2Id,
        carol.id,
        "Into the Woods",
        `Carol had been tracking the signal for weeks from a different angle entirely.
She met them at the edge of Harrow Forest just as the sun began to rise.
In her hand was a receiver she'd built herself — and it was screaming.
"Whatever is transmitting," she said quietly, "it's underground."`,
      ],
    );
    console.log("[+] Chapter 3 created (author: carol).");

    console.log("\n[+] Seed complete!");
    console.log(
      "   Chain: Chapter 1 (alice) → Chapter 2 (bob) → Chapter 3 (carol)",
    );
    console.log(
      "   dave is seeded but has not written anything — useful for testing permissions.\n",
    );
  } catch (err) {
    console.error("[-] Seed failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
