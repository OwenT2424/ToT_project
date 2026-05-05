// Run with: node src/seeders/seed.js
import "dotenv/config";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";

const SALT_ROUNDS = 10;
const CHAPTER_SEED_START = new Date('2026-04-28T00:00:00.000Z');
let chapterSeedOffset = 0;

function nextCreatedAt() {
  const createdAt = new Date(CHAPTER_SEED_START.getTime() + chapterSeedOffset * 1000);
  chapterSeedOffset += 1;
  return createdAt.toISOString().slice(0, 19).replace('T', ' ');
}

async function seed() {
  try {
    console.log('🌱 Starting Phase 2 seed...\n');

    await pool.execute('DELETE FROM Chapters');
    await pool.execute('DELETE FROM Stories');
    await pool.execute('DELETE FROM Users');
    console.log('✅ Cleared existing data.');

    // Users
    const hash  = await bcrypt.hash('password123', SALT_ROUNDS);
    const alice = { id: uuidv4(), username: 'alice', email: 'alice@example.com' };
    const bob   = { id: uuidv4(), username: 'bob',   email: 'bob@example.com'   };
    const carol = { id: uuidv4(), username: 'carol', email: 'carol@example.com' };
    const dave  = { id: uuidv4(), username: 'dave',  email: 'dave@example.com'  };

    for (const u of [alice, bob, carol, dave]) {
      await pool.execute(
        'INSERT INTO Users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [u.id, u.username, u.email, hash]
      );
    }
    console.log('4 users created. (all passwords: password123)');

    // Story
    const storyId = uuidv4();
    await pool.execute(
      'INSERT INTO Stories (id, author_id, title) VALUES (?, ?, ?)',
      [storyId, alice.id, 'The Lost Signal']
    );
    console.log('Story created: "The Lost Signal"');

    // Chapters
    //
    // Full tree:
    //
    //  [ch1]  A Strange Frequency       (alice) — root, 1 child
    //    └─── [ch2]  The Source         (bob)   — 2 children  ← STATE 3 (fork ×2)
    //           ├── [ch3a] Into the Woods (carol) — 2 children ← STATE 3 (fork ×2)
    //           │     ├── [ch7a] Underground    (bob)  — 1 child
    //           │     │     └── [ch8] The Room Below (carol) — dead end ← STATE 1
    //           │     └── [ch7b] Frequency      (dave) — dead end       ← STATE 1
    //           └── [ch3b] The Bunker   (dave)  — 1 child
    //                 └── [ch4] Signals (alice) — 3 children ← STATE 3 (triple fork ×3)
    //                       ├── [ch5a] The Transmission (bob)   — 1 child
    //                       │     └── [ch6] Forty Seven (alice) — dead end ← STATE 1
    //                       ├── [ch5b] The Operator    (carol)  — dead end ← STATE 1
    //                       └── [ch5c] Static          (dave)   — dead end ← STATE 1
    //

    async function insert(id, parentId, authorId, title, content) {
      await pool.execute(
        'INSERT INTO Chapters (id, story_id, parent_id, author_id, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, storyId, parentId, authorId, title, content, nextCreatedAt()]
      );
    }

    const ch1  = uuidv4();
    const ch2  = uuidv4();
    const ch3a = uuidv4();
    const ch3b = uuidv4();
    const ch4  = uuidv4();
    const ch5a = uuidv4();
    const ch5b = uuidv4();
    const ch5c = uuidv4();
    const ch6  = uuidv4();
    const ch7a = uuidv4();
    const ch7b = uuidv4();
    const ch8  = uuidv4();

    await insert(ch1, null, alice.id, 'A Strange Frequency',
      `Alice sat alone in the radio shack, headphones pressed tight against her ears.
The static had been going on for six hours straight — until, just after midnight, it stopped.
In its place came something else: a voice, low and rhythmic, counting backwards from one hundred
in a language she almost recognized.`
    );

    await insert(ch2, ch1, bob.id, 'The Source',
      `Bob had warned her about Station Null — the frequency that wasn't supposed to exist.
He arrived at her door before dawn, a battered notebook tucked under his arm.
"I've heard it before," he said, spreading hand-drawn maps across her desk.
"It's not a broadcast. It's a beacon. And it's very close."`
    );

    await insert(ch3a, ch2, carol.id, 'Into the Woods',
      `Carol had been tracking the signal for weeks from a different angle entirely.
She met them at the edge of Harrow Forest just as the sun began to rise.
In her hand was a receiver she had built herself — and it was screaming.
"Whatever is transmitting," she said quietly, "it's underground."

They stood at the treeline for a long moment. Nobody moved. Nobody spoke.
The receiver kept screaming.`
    );

    await insert(ch3b, ch2, dave.id, 'The Bunker',
      `Dave had a different theory entirely. He ignored the forest and drove east instead,
towards the old Cold War listening station that had been decommissioned — officially — in 1991.
The padlock on the gate was new. The tyre tracks in the mud were newer still.
He called Alice from the car. "Don't go into the trees," he said. "I know where it's coming from."`
    );

    await insert(ch4, ch3b, alice.id, 'Signals',
      `Alice arrived at the bunker twenty minutes after Dave's call.
The door was open. Dave was not outside.
Inside, banks of old equipment hummed with unexpected life, screens flickering with the same
repeating sequence she had heard through her headphones the night before.
On the desk, Dave's notebook lay open. The last line read: they're still broadcasting because
someone is still listening.`
    );

    await insert(ch5a, ch4, bob.id, 'The Transmission',
      `Bob found the source of the transmission in the deepest room of the bunker.
It was a single reel-to-reel tape player, decades old, still spinning.
The voice on the tape was counting. Always counting.
He pressed stop. The room went completely silent for the first time in what he suspected was years.
Then, from somewhere deeper still, something began to count again. Live, this time.`
    );

    await insert(ch5b, ch4, carol.id, 'The Operator',
      `Carol didn't follow them inside. She stayed by the gate, receiver in hand, listening.
The signal had changed. It was no longer counting down.
It was counting up — and it had started from the moment they opened the bunker door.
She radioed Alice: "Whatever you woke up in there, I think it knows you're inside."`
    );

    await insert(ch5c, ch4, dave.id, 'Static',
      `Dave never made it inside.
He had been standing at the entrance when the signal cut out entirely — no countdown, no static,
just silence across every frequency simultaneously.
His phone had no signal. The car wouldn't start. The gate had locked itself.
He sat on the bonnet and waited, watching the bunker door, which had not moved.
Which would not move for another eleven hours.`
    );

    await insert(ch6, ch5a, alice.id, 'Forty Seven',
      `The voice behind the wall said forty-seven and then stopped.
Alice had been counting along without realising it.
She was at forty-seven too.
She pressed her hand flat against the concrete. It was warm. It should not have been warm.
Bob grabbed her arm. "We need to leave," he said. "Right now. We need to leave right now."`
    );

    await insert(ch7a, ch3a, bob.id, 'Underground',
      `Bob had followed Carol into the forest after all.
Twenty metres past the treeline they found it: a rusted hatch set into the ground,
padlocked with the same brand of lock that was on the bunker gate.
"It's connected," Carol said. Bob was already on his knees, trying his pocket knife on the lock.
"Of course it's connected," he said. "Everything is connected."`
    );

    await insert(ch7b, ch3a, dave.id, 'Frequency',
      `Dave ignored the receiver and walked deeper into the trees alone.
He had grown up near Harrow Forest. He knew there was nothing underground — he had played here
as a child, had dug holes, had mapped every root and stone.
Which was why he knew, with absolute certainty, that the tunnel entrance he was now standing in
front of had not been there before.`
    );

    await insert(ch8, ch7a, carol.id, 'The Room Below',
      `The hatch opened onto a ladder. The ladder went down further than it should have.
Carol counted the rungs. Forty-seven.
At the bottom was a room the size of a living room, lit by a single bulb on a long cord.
In the centre of the room was a chair. In the chair was a radio set.
On the frequency dial, someone had taped a small piece of paper.
It read: you took long enough.`
    );

    console.log('12 chapters created.\n');

    console.log('🌲 Full tree:');
    console.log('  [ch1]  A Strange Frequency         (alice) — 1 child');
    console.log('    └─── [ch2]  The Source           (bob)   — 2 children     ← STATE 3 (×2)');
    console.log('           ├── [ch3a] Into the Woods (carol) — 2 children     ← STATE 3 (×2)');
    console.log('           │     ├── [ch7a] Underground   (bob)  — 1 child    ← STATE 2');
    console.log('           │     │     └── [ch8] The Room Below (carol)       ← STATE 1');
    console.log('           │     └── [ch7b] Frequency     (dave) — dead end   ← STATE 1');
    console.log('           └── [ch3b] The Bunker     (dave) — 1 child         ← STATE 2');
    console.log('                 └── [ch4]  Signals  (alice) — 3 children     ← STATE 3 (×3)');
    console.log('                       ├── [ch5a] The Transmission (bob)  — 1 child  ← STATE 2');
    console.log('                       │     └── [ch6] Forty Seven (alice) — dead end ← STATE 1');
    console.log('                       ├── [ch5b] The Operator   (carol) — dead end   ← STATE 1');
    console.log('                       └── [ch5c] Static         (dave)  — dead end   ← STATE 1');
    console.log('');
    console.log('🧪 Test coverage:');
    console.log('  STATE 1 (no branches)        → ch8, ch7b, ch6, ch5b, ch5c');
    console.log('  STATE 2 (single branch)      → ch1, ch3b, ch7a, ch5a');
    console.log('  STATE 3 (2-way fork)         → ch2, ch3a');
    console.log('  STATE 3 (3-way fork)         → ch4  ← badge should show "3 branches"');
    console.log('  Deep nesting (4 levels)      → ch8  ← tests tree indentation');
    console.log('  Same author branches         → ch4 has branches by bob, carol, dave');
    console.log('  Branch by story owner        → ch6 by alice off bob\'s branch\n');

    console.log('👤 Credentials (all passwords: password123):');
    console.log('  alice@example.com  — story owner');
    console.log('  bob@example.com');
    console.log('  carol@example.com');
    console.log('  dave@example.com\n');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await pool.end();
  }
}

seed();