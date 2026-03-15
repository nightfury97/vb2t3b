use vb2t3b;
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Lưu hoạt động (tương tự bài đăng Facebook)
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Lưu lưu bút (lời chúc)
CREATE TABLE guestbook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(100),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255), -- Link ảnh từ S3
    facebook_url VARCHAR(255),
    description VARCHAR(255), -- Ví dụ: "Trùm toán học", "Lớp trưởng gương mẫu"
    is_admin BOOLEAN DEFAULT FALSE
);
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    author_name VARCHAR(100) DEFAULT 'Thành viên ẩn danh',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
ALTER TABLE activities ADD COLUMN likes_count INT DEFAULT 0;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255)
);
ALTER TABLE activities ADD COLUMN author_name VARCHAR(100) DEFAULT 'Thành viên lớp';