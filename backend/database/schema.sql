-- MySQL 8+ schema (use this, or just run: php backend/bin/migrate.php)
CREATE DATABASE IF NOT EXISTS thesis_compliance CHARACTER SET utf8mb4;
USE thesis_compliance;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  institution VARCHAR(150) NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  plan VARCHAR(20) NOT NULL DEFAULT 'starter',
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  status VARCHAR(20) NOT NULL,
  compliance_score INT NOT NULL,
  issues INT NOT NULL DEFAULT 0,
  ai_percentage DECIMAL(5,2) NULL,
  similarity_percentage DECIMAL(5,2) NULL,
  word_count INT NULL,
  summary TEXT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
