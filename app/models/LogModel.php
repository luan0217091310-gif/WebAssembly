<?php
require_once 'Database.php';

class LogModel {
    private $conn;
    private $table_name = "performance_logs";

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function logPerformance($method, $filter_type, $execution_time_ms, $compute_time_ms = null, $total_time_ms = null, $width = null, $height = null, $pixel_count = null, $iterations = 1) {
        if (!$this->conn) return false;

        $query = "INSERT INTO " . $this->table_name . " (method, filter_type, execution_time_ms, compute_time_ms, total_time_ms, width, height, pixel_count, iterations) VALUES (:method, :filter_type, :execution_time_ms, :compute_time_ms, :total_time_ms, :width, :height, :pixel_count, :iterations)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":method", $method);
        $stmt->bindParam(":filter_type", $filter_type);
        $stmt->bindParam(":execution_time_ms", $execution_time_ms);
        $stmt->bindParam(":compute_time_ms", $compute_time_ms);
        $stmt->bindParam(":total_time_ms", $total_time_ms);
        $stmt->bindParam(":width", $width);
        $stmt->bindParam(":height", $height);
        $stmt->bindParam(":pixel_count", $pixel_count);
        $stmt->bindParam(":iterations", $iterations);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getLogs() {
        if (!$this->conn) return [];

        $query = "SELECT method, filter_type, execution_time_ms, compute_time_ms, total_time_ms, width, height, pixel_count, iterations, created_at FROM " . $this->table_name . " ORDER BY created_at DESC LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function clearLogs() {
        if (!$this->conn) return false;

        $query = "DELETE FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        return $stmt->execute();
    }
}
?>
