CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE users_visited_countries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    country_code VARCHAR(255),
);

-- CREATE TABLE countries (
--     id SERIAL PRIMARY KEY,
--     country_code VARCHAR(2) NOT NULL,
--     country_name VARCHAR(255) NOT NULL
-- );

-- import countries csv file to this table.