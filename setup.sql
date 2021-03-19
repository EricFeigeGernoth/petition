DROP TABLE IF EXISTS signature;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE signature (
    id SERIAL PRIMARY KEY,
            -- get rid of first and last!
    signature TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    
 CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR(255),
    url VARCHAR(255), 
    -- whatever user_id we insert MUST exist in the 
    -- id column of the users table 
    user_id INT UNIQUE NOT NULL REFERENCES users(id)
);



