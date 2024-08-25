CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    text VARCHAR(35) NOT NULL,
    author VARCHAR(35) NOT NULL,
    notes TEXT,
    RATING INT CHECK (rating >= 1 AND RATING <=5),
    read_date DATE,
    cover_url TEXT


);