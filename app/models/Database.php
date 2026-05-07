<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        
        // Tự động nhận diện môi trường: Nếu đang chạy ở localhost thì dùng DB local, ngược lại dùng InfinityFree
        $isLocalhost = in_array($_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1', '::1']);
        
        if ($isLocalhost) {
            $this->host = "localhost";
            $this->db_name = "webassembly";
            $this->username = "root";
            $this->password = "";
        } else {
            $this->host = "sql304.infinityfree.com";
            $this->db_name = "if0_41858047_webassembly";
            $this->username = "if0_41858047";
            $this->password = "C6efqRpd9BV"; 
        }

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
