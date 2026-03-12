### Backend Implementation

Work through these phases **in order**. Each phase has a clear goal — finish and verify it before moving on.

---

### Phase 1 — Stub the Routes (`src/routes/index.js`)

**Goal:** Every endpoint exists on the server and responds. No real logic yet.

Register all routes with a temporary placeholder handler:

```javascript
router.get("/stories", (req, res) => res.json({ message: "TODO" }));
```

- [ ] **1a — Auth routes**
    ```
    POST /auth/register
    POST /auth/login
    POST /auth/logout
    ```

- [ ] **1b — Story routes**
    ```
    POST /stories
    GET  /stories
    GET  /stories/:storyId
    ```

- [ ] **1c — Chapter routes**
    ```
    POST /stories/:storyId/chapters
    GET  /stories/:storyId/chapters
    GET  /stories/:storyId/chapters/:chapterId
    POST /stories/:storyId/chapters/:chapterId
    ```

**Done when:** hitting any of the above with a REST client (e.g. Postman) returns `{ "message": "TODO" }`.

---

### Phase 2 — Create the Models

**Goal:** A clean database layer that the controllers will call. No HTTP code here.

Each model is a plain JS object exported from its file:
```javascript
const Model = { create, findById, ... };
module.exports = Model;
```

**INSERT pattern:**
```javascript
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

const id = uuidv4();
await pool.execute(
  "INSERT INTO TableName (col1, col2) VALUES (?, ?)",
  [val1, val2]
);
```

**SELECT pattern** — `pool.execute` returns `[rows, fields]`, so destructure:
```javascript
const [rows] = await pool.execute("SELECT ...", [param]);
return rows[0] || null;   // single-row lookup
return rows;              // multi-row lookup
```

Build the models in this order — each one depends on the table(s) above it in `schema.sql`.

---

#### [ ] 2a — User Model (`src/models/userModel.js`)

- [ ] `create({ username, email, password_hash })`
    - Generate a UUID for `id`.
    - Insert `id`, `username`, `email`, `password_hash` into `Users`.
    - Return `{ id, username, email }`.

- [ ] `findByEmail(email)`
    - Select all columns from `Users` where `email = ?`.
    - Return `rows[0] || null`.

- [ ] `findByUsername(username)`
    - Same as above but match on `username`.
    - Return `rows[0] || null`.

- [ ] `findById(id)`
    - Select **only** `id, username, email, created_at` from `Users` where `id = ?`.
    - Do not select `password_hash`.
    - Return `rows[0] || null`.

---

#### [ ] 2b — Story Model (`src/models/storyModel.js`)

- [ ] `create({ author_id, title })`
    - Generate a UUID for `id`.
    - Insert `id`, `author_id`, `title` into `Stories`.
    - Return `{ id, author_id, title }`.

- [ ] `findAll()`
    - JOIN `Stories s` with `Users u` on `s.author_id = u.id`.
    - Select: `s.id`, `s.title`, `s.created_at`, `u.id AS author_id`, `u.username AS author_username`.
    - Order by `s.created_at DESC`.
    - Return the rows array.

- [ ] `findById(id)`
    - Same JOIN as `findAll()`, but add `WHERE s.id = ?` and remove the ORDER BY.
    - Return `rows[0] || null`.

---

#### [ ] 2c — Chapter Model (`src/models/chapterModel.js`)

- [ ] `create({ story_id, parent_id, author_id, title, content })`
    - Generate a UUID for `id`.
    - Insert `id`, `story_id`, `parent_id`, `author_id`, `title`, `content` into `Chapters`. `parent_id` may be `null`.
    - Return `{ id, story_id, parent_id, author_id, title, content }`.

- [ ] `findRootByStoryId(storyId)`
    - Select from `Chapters` where `story_id = ?` AND `parent_id IS NULL`.
    - Return `rows[0] || null`.

- [ ] `findByStoryId(storyId)`
    - Select all rows from `Chapters` where `story_id = ?`.
    - Return the rows array.

- [ ] `findById(id)`
    - Select all columns from `Chapters` where `id = ?`.
    - Return `rows[0] || null`.

- [ ] `update(id, { title, content })`
    - Update the `Chapters` row where `id = ?`. Both fields will always be provided.
    - No return value needed.

**Done when:** you can `require` each model and call its functions from a scratch file without errors.

---

### Phase 3 — Implement the Controllers

**Goal:** Business logic that sits between the routes and the models. Each controller imports the model(s) it needs and returns JSON responses.

Structure every controller function like this:
```javascript
exports.fnName = async (req, res) => {
  try {
    // ... logic ...
  } catch (err) {
    console.error("fnName error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
```

The logged-in user's ID lives at `req.session.userId`. Controllers can read it freely — it will be *protected* in Phase 5.

Build the controllers in this order — simpler ones first.

---

#### [ ] 3a — Story Controller (`src/controllers/storyController.js`)

Imports needed: `const Story = require("../models/storyModel");`

- [ ] `createStory(req, res)`
    - Destructure `title` from `req.body` — return `400` if missing.
    - Call `Story.create({ author_id: req.session.userId, title })`.
    - Return `201` with the created story object.

- [ ] `getAllStories(req, res)`
    - Call `Story.findAll()` and return the array as JSON.

- [ ] `getStory(req, res)`
    - Call `Story.findById(req.params.storyId)`.
    - Return `404` with `{ error: "Story not found." }` if nothing came back.
    - Otherwise return the story as JSON.

---

#### [ ] 3b — Chapter Controller (`src/controllers/chapterController.js`)

Imports needed:
```javascript
const Chapter = require("../models/chapterModel");
const Story   = require("../models/storyModel");
```

- [ ] `createChapter(req, res)`
    - Extract `storyId` from `req.params`; extract `title`, `content`, `parent_id` from `req.body`.
    - Return `400` if `title` or `content` are missing.
    - Verify the story exists (`Story.findById`) — return `404` if not.
    - **If `parent_id` is absent** (root chapter):
        - Only the story's owner may create it — compare `story.author_id` with `req.session.userId`, return `403` if different.
        - Check for an existing root via `Chapter.findRootByStoryId` — return `409` if one exists.
    - **If `parent_id` is present** (branch chapter):
        - Verify the parent exists (`Chapter.findById(parent_id)`) — return `404` if not.
        - Verify `parent.story_id === storyId` — return `400` if they don't match.
    - Call `Chapter.create(...)`. Always set `story_id` from `req.params`, never from the body.
    - Return `201` with the created chapter.

- [ ] `getChapters(req, res)`
    - Verify the story exists — return `404` if not.
    - Call `Chapter.findByStoryId(req.params.storyId)` and return as JSON.

- [ ] `getChapter(req, res)`
    - Call `Chapter.findById(req.params.chapterId)`.
    - Return `404` if the chapter doesn't exist **or** if its `story_id` doesn't match `req.params.storyId`.
    - Otherwise return the chapter as JSON.

- [ ] `updateChapter(req, res)`
    - Destructure `title` and `content` from `req.body` — return `400` if **both** are absent.
    - Fetch the chapter and apply the same story-membership check as `getChapter` — return `404` if invalid.
    - Only the chapter's own author may update it — compare `chapter.author_id` with `req.session.userId`, return `403` if different.
    - Call `Chapter.update(...)`, then fetch and return the updated chapter.

---

#### [ ] 3c — Auth Controller (`src/controllers/authController.js`)

Imports needed:
```javascript
const bcrypt = require("bcrypt");
const User   = require("../models/userModel");

const SALT_ROUNDS = 10;
```

- [ ] `register(req, res)`
    - Destructure `username`, `email`, `password` from `req.body` — return `400` if any are missing.
    - Call `User.findByEmail` — return `409` if the email is already taken.
    - Call `User.findByUsername` — return `409` if the username is already taken.
    - Hash the password: `const password_hash = await bcrypt.hash(password, SALT_ROUNDS)`.
    - Call `User.create({ username, email, password_hash })`.
    - Store the new user's id in the session: `req.session.userId = user.id`.
    - Return `201` with `{ message: "Registered successfully!", userId: user.id }`.

- [ ] `login(req, res)`
    - Destructure `email` and `password` from `req.body` — return `400` if either is missing.
    - Call `User.findByEmail` — return `401` with `"Invalid credentials."` if not found.
    - Call `bcrypt.compare(password, user.password_hash)` — return `401` with the **same** generic message if it fails. Do not reveal which field was wrong.
    - Set `req.session.userId = user.id` and return `200` with `{ message, userId }`.

- [ ] `logout(req, res)`
    - Call `req.session.destroy(err => { ... })`.
    - Inside the callback: on error return `500`, otherwise clear the `connect.sid` cookie and return a success message.

**Done when:** you can call each controller function and get back correctly shaped JSON (test via Phase 1's stubs temporarily wired to a single controller function).

---

### Phase 4 — Link Controllers to Routes (`src/routes/index.js`)

**Goal:** Replace every `TODO` placeholder with its real controller function.

First, import all three controllers at the top of the file:
```javascript
const authController    = require("../controllers/authController");
const storyController   = require("../controllers/storyController");
const chapterController = require("../controllers/chapterController");
```

Then replace each stub:
```javascript
// Before
router.post("/auth/register", (req, res) => res.json({ message: "TODO" }));

// After
router.post("/auth/register", authController.register);
```

- [ ] **4a** — Replace the three `/auth/*` stubs.
- [ ] **4b** — Replace the three `/stories` stubs.
- [ ] **4c** — Replace the four `/stories/:storyId/chapters` stubs.

**Done when:** all endpoints return real data or meaningful error messages instead of `"TODO"`.

---

### Phase 5 — Create the Auth Middleware (`src/middleware/requireAuth.js`)

**Goal:** A single reusable function that blocks unauthenticated requests before they reach a controller.

- [ ] `requireAuth(req, res, next)`
    - Check whether `req.session` and `req.session.userId` both exist.
    - If not: return `401` with `{ error: "Unauthorized. Please login." }`.
    - If yes: call `next()` to continue to the controller.

Export it as the default:
```javascript
module.exports = requireAuth;
```

**Done when:** calling a protected endpoint without a session returns `401`, and with a session it passes through.

---

### Phase 6 — Protect the Routes (`src/routes/index.js`)

**Goal:** Enforce authentication on routes that modify data.

Import the middleware at the top of the routes file:
```javascript
const requireAuth = require("../middleware/requireAuth");
```

Insert it as the second argument (between the path and the controller) on routes that require a logged-in user:
```javascript
router.post("/stories", requireAuth, storyController.createStory);
```

- [ ] **6a** — Protect `POST /stories`.
- [ ] **6b** — Protect `POST /stories/:storyId/chapters`.
- [ ] **6c** — Protect `POST /stories/:storyId/chapters/:chapterId`.

**Done when:** those three endpoints return `401` when called without a session, and work normally when called after logging in.
