<?php
// Bật hiển thị lỗi để dễ debug nếu có
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Xử lý CORS và preflight request
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Định nghĩa BASE_URL để các file CSS/JS luôn gọi đúng đường dẫn tuyệt đối
define('BASE_URL', rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/');

// Lấy URL từ request, mặc định là home/index
$url = isset($_GET['url']) && $_GET['url'] !== '' ? rtrim($_GET['url'], '/') : 'home/index';
$url = explode('/', $url);

$controllerName = ucfirst($url[0]) . 'Controller';
$methodName = isset($url[1]) ? $url[1] : 'index';

$controllerFile = __DIR__ . '/../app/controllers/' . $controllerName . '.php';

if (file_exists($controllerFile)) {
    require_once $controllerFile;
    
    if (class_exists($controllerName)) {
        $controller = new $controllerName();

        if (method_exists($controller, $methodName)) {
            // Chạy method của controller
            $controller->$methodName();
        } else {
            echo "404 - Method '$methodName' not found in controller '$controllerName'";
        }
    } else {
        echo "404 - Class '$controllerName' not found in file";
    }
} else {
    echo "404 - Controller file '$controllerName.php' not found (Path: $controllerFile)";
}
?>
