document.addEventListener('DOMContentLoaded', async () => {
    const imageUpload = document.getElementById('image-upload');
    const filterSelect = document.getElementById('filter-select');
    const btnJs = document.getElementById('btn-js');
    const btnWasm = document.getElementById('btn-wasm');
    const canvasOriginal = document.getElementById('canvas-original');
    const canvasResult = document.getElementById('canvas-result');
    const ctxOriginal = canvasOriginal.getContext('2d');
    const ctxResult = canvasResult.getContext('2d');
    const execTimeDisplay = document.getElementById('exec-time');
    const methodBadge = document.getElementById('method-badge');
    const logsList = document.getElementById('performance-logs-list');

    let currentImage = null;
    let wasmModule = null;
    let wasmMemory = null;

    // Load Wasm Module
    try {
        const response = await fetch('wasm/image_processing.wasm');
        const buffer = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(buffer);
        wasmModule = instance.exports;
        wasmMemory = wasmModule.memory;
        console.log("WASM Module Loaded Successfully.");
    } catch (e) {
        console.error("Failed to load WASM module", e);
        alert("Failed to load WebAssembly module. Make sure your server is running.");
    }

    // Load logs
    fetchLogs();

    // Image Upload Handler
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                // For demo purposes, we scale down massive images to prevent browser hang
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvasOriginal.width = width;
                canvasOriginal.height = height;
                canvasResult.width = width;
                canvasResult.height = height;

                ctxOriginal.drawImage(img, 0, 0, width, height);
                ctxResult.drawImage(img, 0, 0, width, height);
                
                execTimeDisplay.innerText = "0 ms";
                methodBadge.innerText = "";
                methodBadge.style.background = "transparent";
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    function getOriginalImageData() {
        if (!currentImage) return null;
        return ctxOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);
    }

    function putResultImageData(imageData) {
        ctxResult.putImageData(imageData, 0, 0);
    }

    async function logPerformance(method, filterType, timeMs) {
        try {
            await fetch('index.php?url=log/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: method,
                    filter_type: filterType,
                    execution_time_ms: timeMs
                })
            });
            fetchLogs();
        } catch (e) {
            console.error("Failed to log", e);
        }
    }

    async function fetchLogs() {
        try {
            const res = await fetch('index.php?url=log/get');
            const data = await res.json();
            logsList.innerHTML = '';
            if (data.logs && data.logs.length > 0) {
                data.logs.forEach(log => {
                    const li = document.createElement('li');
                    li.className = log.method === 'wasm' ? 'log-wasm' : 'log-js';
                    li.innerHTML = `<span>[${log.method.toUpperCase()}] ${log.filter_type}</span> 
                                    <span>${parseFloat(log.execution_time_ms).toFixed(2)} ms</span>`;
                    logsList.appendChild(li);
                });
            } else {
                logsList.innerHTML = '<li>No logs yet.</li>';
            }
        } catch (e) {
            console.error("Failed to fetch logs", e);
            logsList.innerHTML = '<li>Failed to load logs (DB might not be configured).</li>';
        }
    }

    // PURE JS IMPLEMENTATIONS
    function jsInvert(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];         // R
            data[i + 1] = 255 - data[i + 1]; // G
            data[i + 2] = 255 - data[i + 2]; // B
        }
    }

    function jsGrayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            // Integer approximation of luminosity
            let gray = (r * 77 + g * 150 + b * 29) >> 8;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    // EVENT LISTENERS
    btnJs.addEventListener('click', () => {
        const imageData = getOriginalImageData();
        if (!imageData) return alert("Upload an image first!");

        const filter = filterSelect.value;
        const data = imageData.data;

        const t0 = performance.now();
        
        if (filter === 'invert') {
            jsInvert(data);
        } else if (filter === 'grayscale') {
            jsGrayscale(data);
        }
        
        const t1 = performance.now();
        putResultImageData(imageData);
        
        const timeTaken = t1 - t0;
        execTimeDisplay.innerText = timeTaken.toFixed(2) + " ms";
        methodBadge.innerText = "JS";
        methodBadge.style.background = "var(--accent-js)";
        
        logPerformance('js', filter, timeTaken);
    });

    btnWasm.addEventListener('click', () => {
        if (!wasmModule) return alert("WASM module not loaded!");
        const imageData = getOriginalImageData();
        if (!imageData) return alert("Upload an image first!");

        const filter = filterSelect.value;
        const data = imageData.data;
        const length = data.length;

        // Ensure WASM memory is large enough
        // 1 page = 64KB
        const requiredPages = Math.ceil(length / (64 * 1024));
        const currentPages = wasmMemory.buffer.byteLength / (64 * 1024);
        if (currentPages < requiredPages) {
            wasmMemory.grow(requiredPages - currentPages);
        }

        // Copy image data to WASM memory
        const wasmArray = new Uint8Array(wasmMemory.buffer, 0, length);
        wasmArray.set(data);

        const t0 = performance.now();
        
        if (filter === 'invert') {
            wasmModule.invert(0, length);
        } else if (filter === 'grayscale') {
            wasmModule.grayscale(0, length);
        }

        const t1 = performance.now();
        
        // Copy back to JS
        data.set(wasmArray);
        putResultImageData(imageData);

        const timeTaken = t1 - t0;
        execTimeDisplay.innerText = timeTaken.toFixed(2) + " ms";
        methodBadge.innerText = "WASM";
        methodBadge.style.background = "var(--accent-wasm)";

        logPerformance('wasm', filter, timeTaken);
    });

    // THEME TOGGLE LOGIC
    const themeToggleBtn = document.getElementById('theme-toggle');
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggleBtn.innerText = '☀️ Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleBtn.innerText = '🌙 Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerText = '☀️ Light Mode';
    }
});
