CREATE DATABASE IF NOT EXISTS bluebook_db;
USE bluebook_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'Học sinh',
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('reading', 'math') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_number INT NOT NULL,
    passage TEXT,
    prompt TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer_index INT NOT NULL,
    module INT DEFAULT 1,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT,
    test_type VARCHAR(50) NOT NULL,
    answers JSON NOT NULL,
    score INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Insert a test user: hocsinh1@gmail.com / password: 123456
-- Insert an admin user: admin@bluebook.com / password: 123456
INSERT IGNORE INTO users (email, password, role) VALUES 
('hocsinh1@gmail.com', '$2b$10$DA3O2Z5ihrqmkeUOn5NwIeQO8EZ8eZdTaEOnjyAF7AOU/8DgTNQA.', 'student'),
('admin@bluebook.com', '$2b$10$DA3O2Z5ihrqmkeUOn5NwIeQO8EZ8eZdTaEOnjyAF7AOU/8DgTNQA.', 'admin');
