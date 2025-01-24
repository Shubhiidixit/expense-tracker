CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    date DATE NOT NULL
);
