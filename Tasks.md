# Sprint-4 Plan (1)

This sprint will be aimed at implementing the brannching logic and to actually show that branch structure in the frontend. What we need is a few modifications of backend code and significant changes in the frontend.

### Backend Modifications

Work through these phases **in order**. Each phase has a clear goal — finish and verify it before moving on.

---

### Task 1 — Stub the Routes (`src/routes/index.js`) - KRIS

**Goal:** Initialize a chapter route which will fetch the chapter tree

```javascript
router.get("/stories", (req, res) => res.json({ message: "TODO" }));
```

- [ ] **Chapter routes**

  ```javascript
  GET  /stories/:storyId/tree // fetch chapter tree
  ```

**API Response for now:** `{ "message": "TODO" }`.
**Once finished:** Announce in the group chat that so that one of us can test the API by hitting the endpoint.

**Git & Project Workflow Details:**
- Branch Name: kris-s4-routes-branch
- Staging file: `src/routes/index.js` only
- Always pull before pushing

---

### Task 2 — Chapter Model - OWEN

**Goal:** A function called `findTreeByStory(story_id)` which communicates with the database to fetch the chapter tree.

**Pattern**:

```javascript
async functionName(parameter) {
  const [rows] = await pool.execute(`<SQL QUERY GO HERE>`);
  return rows
}

```

**Query**: So we need a chapter tree from chapters table. We need the following information from the query: Chapter ID (`id`), Parent ID (`parent_id`), Title (`title`), and Creation Date (`created_at`) (all of these are in Chapters Table) and Username (`username`) from Users Table. So basically, you write a join query on Chapters and Users table and join at `chapters.author_id = users.id` where `chapters.story_id = ?`. Then at the end, order the results in ascending order based on the creation date.

**Git & Project Workflow Details:**
- Branch Name: owen-s4-model-branch
- Staging file: `src/routes/index.js` only
- Always pull before pushing

---

### Task 3 — Chapter Controller - TEJAS

- Previously, any chapter without a parent_id was treated as a root chapter and only the story owenr could create it. This restriction still stands for root chapters.
- Right now, any logged-in user should be able to branch from any existing chapter as long as they supply a valid parent ID.
- Add a new `getTree` endpoint - must return a flat array of all chapters for a story.

**Git & Project Workflow Details:**
- Branch Name: tejas-s4-controller-branch
- Staging file: `src/routes/index.js` only
- Always pull before pushing

### Task 4 - Zaynah & the whole Team

Understand the frontend:
- Research and understand how PUG templates work
- Then try to understand how the frontend and backend are served - ask for help from Owen/Kris/Tejas if needed
- Ask questions!