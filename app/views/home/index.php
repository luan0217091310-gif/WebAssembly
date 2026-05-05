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
                <div class="control-group">
                    <label for="filter-select">Filter:</label>
                    <select id="filter-select" class="modern-select">
                        <option value="invert">Invert</option>
                        <option value="grayscale">Grayscale</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="iterations-input">Iterations:</label>
                    <input id="iterations-input" class="modern-input" type="number" min="1" max="50" value="10">
                </div>
                <div class="control-group actions">
                    <button id="btn-js" class="action-btn js-btn" type="button" disabled>Run Pure JS</button>
                    <button id="btn-wasm" class="action-btn wasm-btn" type="button" disabled>Run WebAssembly</button>
                    <button id="btn-benchmark" class="action-btn benchmark-btn" type="button" disabled>Run Benchmark</button>
                </div>
            </section>

            <section class="benchmark-panel glass-panel">
                <div class="panel-heading">
                    <div>
                        <h2>Academic Benchmark</h2>
                        <p class="panel-note">Average timing uses repeated runs on the same image and filter.</p>
                    </div>
                    <span id="speed-ratio" class="status-pill status-idle">No benchmark</span>
                </div>
                <div class="metric-grid">
                    <div class="metric-card">
                        <span>Last Compute</span>
                        <strong id="compute-time">0 ms</strong>
                    </div>
                    <div class="metric-card">
                        <span>Last Total</span>
                        <strong id="total-time">0 ms</strong>
                    </div>
                    <div class="metric-card">
                        <span>JS Average</span>
                        <strong id="js-average">0 ms</strong>
                    </div>
                    <div class="metric-card">
                        <span>WASM Average</span>
                        <strong id="wasm-average">0 ms</strong>
                    </div>
                </div>
                <div class="chart-box" aria-label="Average total time comparison">
                    <div class="chart-row">
                        <span>JS</span>
                        <div class="chart-track">
                            <div id="chart-js-bar" class="chart-fill chart-js" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="chart-row">
                        <span>WASM</span>
                        <div class="chart-track">
                            <div id="chart-wasm-bar" class="chart-fill chart-wasm" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
                <p id="benchmark-summary" class="panel-note">Run benchmark to compare average total time.</p>
            </section>

            <section class="results-section">
                <div class="image-box glass-panel">
                    <h3>Original</h3>
                    <div id="original-drop-zone" class="canvas-wrap drop-zone">
                        <canvas id="canvas-original" width="640" height="360"></canvas>
                        <div id="original-placeholder" class="canvas-placeholder">
                            <strong>No image loaded</strong>
                            <span>Drop image here or browse below.</span>
                        </div>
                    </div>
                    <div class="image-actions">
                        <label for="image-upload" class="upload-btn">
                            Browse Image
                            <input type="file" id="image-upload" accept="image/*">
                        </label>
                        <p class="control-hint">Drop image into the preview area or browse from disk.</p>
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
                    <div class="image-actions result-actions">
                        <button id="btn-download" class="secondary-btn" type="button" disabled>Download Result</button>
                    </div>
                    <p id="run-status" class="panel-note">Upload an image to start benchmarking.</p>
                </div>
            </section>
        </main>
        
        <aside class="logs-panel glass-panel">
            <div class="logs-header">
                <div>
                    <h2>Recent Performance Logs</h2>
                    <p class="panel-note">Latest benchmark runs from MySQL or browser fallback storage.</p>
                </div>
                <div class="logs-actions">
                    <span id="logs-status" class="status-pill status-loading">Loading</span>
                    <button id="btn-clear-logs" class="danger-btn" type="button">Clear Logs</button>
                </div>
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
