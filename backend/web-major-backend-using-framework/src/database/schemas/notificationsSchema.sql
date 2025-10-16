CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- theme
    theme TEXT NOT NULL,
    -- data
    message TEXT NOT NULL,
    -- target
    target TEXT NOT NULL
);