-- Run this once to set up the database schema
-- Usage: docker exec -i mysql_db mysql -u root -prootpassword app_db < schema.sql
-- Note: Run the command using Command Prompt; Not PowerShell

CREATE TABLE IF NOT EXISTS Users (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  username    VARCHAR(50)   NOT NULL UNIQUE,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Stories (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  author_id   CHAR(36)      NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Chapters (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  story_id    CHAR(36)      NOT NULL,
  parent_id   CHAR(36)      NULL,  -- NULL = root chapter; ready for branching later
  author_id   CHAR(36)      NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  content     TEXT          NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id)  REFERENCES Stories(id)  ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES Users(id)    ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES Chapters(id) ON DELETE SET NULL
);