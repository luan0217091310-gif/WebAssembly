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
                <div>
                    <h1>High Performance WebAssembly</h1>
                    <p>Bridging C++ with JavaScript for heavy computation offloading.</p>
                </div>
                <div class="header-actions">
                    <span id="wasm-status" class="status-pill status-loading">Loading WASM</span>
                    <span id="image-status" class="status-pill status-idle">No image</span>
                    <button id="theme-toggle" class="theme-btn" type="button">Dark Mode</button>
                </div>
            </div>
        </header>

        <main class="main-content">
            <section class="controls-section glass-panel">
                <div class="control-group upload-group">
                    <label for="image-upload" class="upload-btn">
                        Browse Image
                        <input type="file" id="image-upload" accept="image/*">
                    </label>
                    <p class="control-hint">Use a larger image for clearer timing differences.</p>
                </div>
                <div class="control-group">
                    <label for="filter-select">Filter:</label>
                    <select id="filter-select" class="modern-select">
                        <option value="invert">Invert</option>
                        <option value="grayscale">Grayscale</option>
                    </select>
                </div>
                <div class="control-group actions">
                    <button id="btn-js" class="action-btn js-btn" type="button" disabled>Run Pure JS</button>
                    <button id="btn-wasm" class="action-btn wasm-btn" type="button" disabled>Run WebAssembly</button>
                </div>
            </section>

            <section class="results-section">
                <div class="image-box glass-panel">
                    <h3>Original</h3>
                    <div class="canvas-wrap">
                        <canvas id="canvas-original" width="640" height="360"></canvas>
                        <div id="original-placeholder" class="canvas-placeholder">
                            <strong>No image loaded</strong>
                            <span>Choose an image to preview it here.</span>
                        </div>
                    </div>
                </div>
                <div class="image-box glass-panel">
                    <h3>Result <span id="method-badge" class="badge"></span></h3>
                    <div class="canvas-wrap">
                        <canvas id="canvas-result" width="640" height="360"></canvas>
                        <div id="result-placeholder" class="canvas-placeholder">
                            <strong>Waiting for benchmark</strong>
                            <span>Run JS or WASM after uploading an image.</span>
                        </div>
                    </div>
                    <div class="performance-stats">
                        <p>Execution Time: <strong id="exec-time">0 ms</strong></p>
                    </div>
                    <p id="run-status" class="panel-note">Upload an image to start benchmarking.</p>
                </div>
            </section>
        </main>
        
        <aside class="logs-panel glass-panel">
            <div class="logs-header">
                <h2>Recent Performance Logs</h2>
                <span id="logs-status" class="status-pill status-loading">Loading</span>
            </div>
            <ul id="performance-logs-list">
                <li class="log-empty">Loading logs...</li>
            </ul>
        </aside>
    </div>
    <div id="toast-region" class="toast-region" aria-live="polite" aria-atomic="true"></div>
    
    <script src="js/app.js"></script>
</body>
</html>
