<?php
require_once 'Database.php';

class LogModel {
    private $conn;
    private $table_name = "performance_logs";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function logPerformance($method, $filter_type, $execution_time_ms) {
        if (!$this->conn) return false;

        $query = "INSERT INTO " . $this->table_name . " (method, filter_type, execution_time_ms) VALUES (:method, :filter_type, :execution_time_ms)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":method", $method);
        $stmt->bindParam(":filter_type", $filter_type);
        $stmt->bindParam(":execution_time_ms", $execution_time_ms);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getLogs() {
        if (!$this->conn) return [];

        $query = "SELECT method, filter_type, execution_time_ms, created_at FROM " . $this->table_name . " ORDER BY created_at DESC LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
