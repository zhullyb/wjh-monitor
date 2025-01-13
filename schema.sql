CREATE TABLE IF NOT EXISTS DATA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    online_status BOOLEAN NOT NULL,
    notify BOOLEAN DEFAULT FALSE,
    other TEXT
);

INSERT INTO
    DATA (
        response_time,
        success,
        online_status,
        notify,
        other
    )
VALUES (100, 1, 1, 0, 'initial');
