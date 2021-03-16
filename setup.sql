DROP TABLE IF EXISTS signature;
DROP TABLE IF EXISTS users;

CREATE TABLE signature (
    id SERIAL PRIMARY KEY,
            -- get rid of first and last!
    signature TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    -- id         SERIAL PRIMARY KEY,
    -- first_name VARCHAR NOT NULL CHECK (first_name != ''),
    -- last_name  VARCHAR NOT NULL CHECK (last_name != ''),
    -- signature  VARCHAR NOT NULL CHECK (signature != ''),
    -- timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

