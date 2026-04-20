CREATE DATABASE IF NOT EXISTS varian_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE varian_db;

-- ─── USERS (admin dashboard access) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  role       ENUM('admin','viewer') NOT NULL DEFAULT 'viewer',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── CHALLENGES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  icon       VARCHAR(50)  NOT NULL UNIQUE,
  label      VARCHAR(100) NOT NULL DEFAULT 'CHALLENGE',
  text       TEXT         NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── ROOT CAUSES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS root_causes (
  id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  challenge_id INT          NOT NULL,
  cause_text   TEXT         NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── SOLUTIONS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solutions (
  id           VARCHAR(100) NOT NULL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  subtitle     TEXT,
  is_aos       TINYINT(1)   NOT NULL DEFAULT 0,
  icon         VARCHAR(100) NOT NULL DEFAULT 'aos',
  left_label   VARCHAR(100)          DEFAULT NULL,
  right_label  VARCHAR(100)          DEFAULT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── SOLUTION FEATURES (for feature-type solutions like ARIA CORE, Eclipse) ──
CREATE TABLE IF NOT EXISTS solution_features (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  solution_id VARCHAR(100) NOT NULL,
  label       VARCHAR(255) NOT NULL,
  heading     VARCHAR(255) NOT NULL,
  body        TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── SOLUTION FEATURE BULLETS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solution_feature_bullets (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  feature_id INT          NOT NULL,
  bullet     TEXT         NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (feature_id) REFERENCES solution_features(id) ON DELETE CASCADE
);

-- ─── SOLUTION DELIVERABLES (for AOS-type solutions) ──────────────────────────
CREATE TABLE IF NOT EXISTS solution_deliverables (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  solution_id VARCHAR(100) NOT NULL,
  item_text   TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
);

-- ─── SOLUTION USE CASES (for AOS-type solutions) ─────────────────────────────
CREATE TABLE IF NOT EXISTS solution_use_cases (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  solution_id VARCHAR(100) NOT NULL,
  item_text   TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
);

-- ─── CHALLENGE ↔ SOLUTION MAPPING ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_solutions (
  challenge_id INT          NOT NULL,
  solution_id  VARCHAR(100) NOT NULL,
  sort_order   INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (challenge_id, solution_id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
  FOREIGN KEY (solution_id)  REFERENCES solutions(id)  ON DELETE CASCADE
);

-- ─── LOCATIONS (globe pins) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id          INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  lat         DECIMAL(10, 6) NOT NULL,
  lng         DECIMAL(10, 6) NOT NULL,
  image_url   VARCHAR(500)   NOT NULL,
  stat        VARCHAR(255)   NOT NULL,
  stat_desc   VARCHAR(255)   NOT NULL,
  sort_order  INT            NOT NULL DEFAULT 0,
  is_active   TINYINT(1)     NOT NULL DEFAULT 1,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── USER SESSIONS (analytics — which challenges/solutions viewed) ────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id                 VARCHAR(36)  NOT NULL PRIMARY KEY,
  session_token      VARCHAR(255) NOT NULL UNIQUE,
  challenge_id       INT                   DEFAULT NULL,
  selected_causes    JSON                  DEFAULT NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL
);

-- ─── SOLUTION VIEWS (analytics) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solution_views (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id  VARCHAR(36)  NOT NULL,
  solution_id VARCHAR(100) NOT NULL,
  viewed_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE
);

-- ─── FEEDBACK ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id  VARCHAR(36)           DEFAULT NULL,
  rating      TINYINT               DEFAULT NULL,
  comment     TEXT                  DEFAULT NULL,
  page        VARCHAR(100)          DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_root_causes_challenge ON root_causes(challenge_id);
CREATE INDEX idx_sf_solution ON solution_features(solution_id);
CREATE INDEX idx_sfb_feature ON solution_feature_bullets(feature_id);
CREATE INDEX idx_sd_solution ON solution_deliverables(solution_id);
CREATE INDEX idx_suc_solution ON solution_use_cases(solution_id);
CREATE INDEX idx_sv_session ON solution_views(session_id);
CREATE INDEX idx_sv_solution ON solution_views(solution_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);