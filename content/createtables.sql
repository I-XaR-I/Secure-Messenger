create database securemessenger;
use securemessenger;

CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email varchar(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    aes_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    encrypted_message TEXT NOT NULL,
    -- encrypted_session_key TEXT NOT NULL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (recipient_id) REFERENCES Users(user_id)
);

CREATE TABLE Conversations (
    conversation_id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message_timestamp TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES Users(user_id),
    FOREIGN KEY (user2_id) REFERENCES Users(user_id),
    UNIQUE (user1_id, user2_id)  -- To avoid duplicate conversations between the same users
);

CREATE TABLE Message_Status (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    status ENUM('sent', 'delivered', 'read') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES Messages(message_id)
);

CREATE TABLE User_Keys (
    key_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    rsa_public_key TEXT NOT NULL,
    rsa_private_key TEXT UNIQUE,  -- Ensure uniqueness of the private key
    aes_key TEXT,  -- New attribute for AES key
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

DROP TABLE IF EXISTS Hosted_Keys;

CREATE VIEW Hosted_Keys AS
SELECT user_id, rsa_public_key
FROM User_Keys;

CREATE TABLE Authentication (
    auth_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    last_login TIMESTAMP,
    login_attempts INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Friends (
    friendship_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (friend_id) REFERENCES Users(user_id),
    UNIQUE (user_id, friend_id)  -- To avoid duplicate friendships between the same users
);
