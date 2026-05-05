<?php
class Database {
    private $host = "localhost";
    private $db_name = "wasm_demo";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // Silently fail if DB is not setup, as this is mostly a frontend Wasm demo
            // echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
