CREATE DATABASE IF NOT EXISTS wasm_demo;
USE wasm_demo;

CREATE TABLE IF NOT EXISTS performance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method VARCHAR(50) NOT NULL,
    filter_type VARCHAR(50) NOT NULL,
    execution_time_ms FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
