<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wasm vs JS Image Processing</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="app-container">
        <header class="glass-header">
            <div class="header-top">
                <h1>High Performance WebAssembly</h1>
                <button id="theme-toggle" class="theme-btn">🌙 Dark Mode</button>
            </div>
            <p>Bridging C++ with JavaScript for heavy computation offloading.</p>
        </header>

        <main class="main-content">
            <section class="controls-section glass-panel">
                <div class="control-group">
                    <label for="image-upload" class="upload-btn">
                        Upload Image
                        <input type="file" id="image-upload" accept="image/*">
                    </label>
                </div>
                <div class="control-group">
                    <label for="filter-select">Filter:</label>
                    <select id="filter-select" class="modern-select">
                        <option value="invert">Invert</option>
                        <option value="grayscale">Grayscale</option>
                    </select>
                </div>
                <div class="control-group actions">
                    <button id="btn-js" class="action-btn js-btn">Run Pure JS</button>
                    <button id="btn-wasm" class="action-btn wasm-btn">Run WebAssembly</button>
                </div>
            </section>

            <section class="results-section">
                <div class="image-box glass-panel">
                    <h3>Original</h3>
                    <canvas id="canvas-original"></canvas>
                </div>
                <div class="image-box glass-panel">
                    <h3>Result <span id="method-badge" class="badge"></span></h3>
                    <canvas id="canvas-result"></canvas>
                    <div class="performance-stats">
                        <p>Execution Time: <strong id="exec-time">0 ms</strong></p>
                    </div>
                </div>
            </section>
        </main>
        
        <aside class="logs-panel glass-panel">
            <h2>Recent Performance Logs (Database)</h2>
            <ul id="performance-logs-list">
                <li>Loading logs...</li>
            </ul>
        </aside>
    </div>
    
    <script src="js/app.js"></script>
</body>
</html>
