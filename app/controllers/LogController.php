<?php
require_once '../app/models/LogModel.php';

class LogController {
    public function log() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['method']) && isset($data['filter_type']) && isset($data['execution_time_ms'])) {
                $logModel = new LogModel();
                $success = $logModel->logPerformance($data['method'], $data['filter_type'], $data['execution_time_ms']);
                echo json_encode(['success' => $success]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid data']);
            }
        }
    }

    public function get() {
        $logModel = new LogModel();
        $logs = $logModel->getLogs();
        echo json_encode(['logs' => $logs]);
    }
}
?>
