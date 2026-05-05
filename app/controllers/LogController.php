<?php
require_once '../app/models/LogModel.php';

class LogController {
    public function log() {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['method']) && isset($data['filter_type']) && isset($data['execution_time_ms'])) {
                $logModel = new LogModel();
                $success = $logModel->logPerformance(
                    $data['method'],
                    $data['filter_type'],
                    $data['execution_time_ms'],
                    $data['compute_time_ms'] ?? $data['execution_time_ms'],
                    $data['total_time_ms'] ?? $data['execution_time_ms'],
                    $data['width'] ?? null,
                    $data['height'] ?? null,
                    $data['pixel_count'] ?? null,
                    $data['iterations'] ?? 1
                );
                echo json_encode(['success' => $success]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid data']);
            }
        }
    }

    public function get() {
        header('Content-Type: application/json');

        $logModel = new LogModel();
        $logs = $logModel->getLogs();
        echo json_encode(['logs' => $logs]);
    }

    public function clear() {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $logModel = new LogModel();
            $success = $logModel->clearLogs();
            echo json_encode(['success' => $success]);
        } else {
            echo json_encode(['success' => false, 'message' => 'POST required']);
        }
    }
}
?>
