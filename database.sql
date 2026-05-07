CREATE DATABASE IF NOT EXISTS webassembly;
USE webassembly;

DROP TABLE IF EXISTS performance_logs;
CREATE TABLE IF NOT EXISTS performance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method VARCHAR(50) NOT NULL,
    filter_type VARCHAR(50) NOT NULL,
    execution_time_ms FLOAT NOT NULL,
    compute_time_ms FLOAT NULL,
    total_time_ms FLOAT NULL,
    width INT NULL,
    height INT NULL,
    pixel_count INT NULL,
    iterations INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
