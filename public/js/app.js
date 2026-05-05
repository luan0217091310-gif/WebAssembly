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
    const wasmStatus = document.getElementById('wasm-status');
    const imageStatus = document.getElementById('image-status');
    const logsStatus = document.getElementById('logs-status');
    const runStatus = document.getElementById('run-status');
    const originalPlaceholder = document.getElementById('original-placeholder');
    const resultPlaceholder = document.getElementById('result-placeholder');
    const toastRegion = document.getElementById('toast-region');
    const themeToggleBtn = document.getElementById('theme-toggle');

    let currentImage = null;
    let wasmModule = null;
    let wasmMemory = null;
    let hasResult = false;

    function setStatusPill(element, status, text) {
        element.classList.remove('status-ready', 'status-loading', 'status-idle', 'status-error');
        element.classList.add(`status-${status}`);
        element.innerText = text;
    }

    function setWasmStatus(status, text) {
        setStatusPill(wasmStatus, status, text);
        updateActionState();
    }

    function setImagePlaceholders(hasImage, resultReady) {
        originalPlaceholder.classList.toggle('is-hidden', hasImage);
        resultPlaceholder.classList.toggle('is-hidden', resultReady);
    }

    function updateActionState() {
        const hasImage = Boolean(currentImage);
        btnJs.disabled = !hasImage;
        btnWasm.disabled = !hasImage || !wasmModule;
        btnJs.title = hasImage ? '' : 'Upload an image first';
        btnWasm.title = !wasmModule ? 'WASM module is not ready' : btnJs.title;
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastRegion.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('is-visible'));
        window.setTimeout(() => {
            toast.classList.remove('is-visible');
            window.setTimeout(() => toast.remove(), 220);
        }, 3200);
    }

    function setMethodBadge(method) {
        methodBadge.classList.remove('is-js', 'is-wasm');

        if (!method) {
            methodBadge.innerText = '';
            return;
        }

        methodBadge.innerText = method.toUpperCase();
        methodBadge.classList.add(method === 'wasm' ? 'is-wasm' : 'is-js');
    }

    function resetResultState() {
        hasResult = false;
        ctxResult.clearRect(0, 0, canvasResult.width, canvasResult.height);
        execTimeDisplay.innerText = '0 ms';
        setMethodBadge('');
        runStatus.innerText = 'Choose JS or WASM to process the uploaded image.';
        setImagePlaceholders(Boolean(currentImage), hasResult);
    }

    function renderLogState(message, className = 'log-empty') {
        logsList.innerHTML = '';
        const li = document.createElement('li');
        li.className = className;
        li.textContent = message;
        logsList.appendChild(li);
    }

    setImagePlaceholders(false, false);
    updateActionState();
    setWasmStatus('loading', 'Loading WASM');

    try {
        const response = await fetch('wasm/image_processing.wasm');
        if (!response.ok) {
            throw new Error(`WASM request failed with ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(buffer);
        wasmModule = instance.exports;
        wasmMemory = wasmModule.memory;
        setWasmStatus('ready', 'WASM ready');
    } catch (error) {
        console.error('Failed to load WASM module', error);
        setWasmStatus('error', 'WASM unavailable');
        showToast('WebAssembly could not be loaded. You can still run the JS benchmark.', 'error');
    }

    fetchLogs();

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                const maxWidth = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvasOriginal.width = width;
                canvasOriginal.height = height;
                canvasResult.width = width;
                canvasResult.height = height;

                ctxOriginal.drawImage(img, 0, 0, width, height);
                setStatusPill(imageStatus, 'ready', `${width} x ${height}`);
                resetResultState();
                updateActionState();
                showToast('Image ready for benchmarking.', 'success');
            };
            img.onerror = () => {
                showToast('The selected file could not be loaded as an image.', 'error');
            };
            img.src = readerEvent.target.result;
        };
        reader.onerror = () => {
            showToast('The selected file could not be read.', 'error');
        };
        reader.readAsDataURL(file);
    });

    function getOriginalImageData() {
        if (!currentImage) {
            return null;
        }
        return ctxOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);
    }

    function putResultImageData(imageData) {
        ctxResult.putImageData(imageData, 0, 0);
        hasResult = true;
        setImagePlaceholders(true, true);
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
        } catch (error) {
            console.error('Failed to log performance result', error);
            showToast('Result displayed, but the performance log could not be saved.', 'error');
        }
    }

    async function fetchLogs() {
        setStatusPill(logsStatus, 'loading', 'Loading');
        renderLogState('Loading logs...');

        try {
            const response = await fetch('index.php?url=log/get');
            if (!response.ok) {
                throw new Error(`Log request failed with ${response.status}`);
            }

            const data = await response.json();
            logsList.innerHTML = '';

            if (data.logs && data.logs.length > 0) {
                data.logs.forEach((log) => {
                    const li = document.createElement('li');
                    li.className = log.method === 'wasm' ? 'log-wasm' : 'log-js';

                    const label = document.createElement('span');
                    label.textContent = `[${log.method.toUpperCase()}] ${log.filter_type}`;

                    const time = document.createElement('span');
                    time.textContent = `${parseFloat(log.execution_time_ms).toFixed(2)} ms`;

                    li.appendChild(label);
                    li.appendChild(time);
                    logsList.appendChild(li);
                });
                setStatusPill(logsStatus, 'ready', 'Live');
            } else {
                renderLogState('No logs yet.');
                setStatusPill(logsStatus, 'idle', 'Empty');
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
            renderLogState('Logs unavailable. Check the database configuration.', 'log-error');
            setStatusPill(logsStatus, 'error', 'Offline');
        }
    }

    function jsInvert(data) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    function jsGrayscale(data) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = (r * 77 + g * 150 + b * 29) >> 8;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }

    btnJs.addEventListener('click', () => {
        const imageData = getOriginalImageData();
        if (!imageData) {
            showToast('Upload an image before running a benchmark.', 'error');
            updateActionState();
            return;
        }

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
        execTimeDisplay.innerText = `${timeTaken.toFixed(2)} ms`;
        setMethodBadge('js');
        runStatus.innerText = `Pure JS completed ${filter} in ${timeTaken.toFixed(2)} ms.`;
        logPerformance('js', filter, timeTaken);
    });

    btnWasm.addEventListener('click', () => {
        if (!wasmModule) {
            showToast('WASM is not ready. Try the JS benchmark or refresh the page.', 'error');
            updateActionState();
            return;
        }

        const imageData = getOriginalImageData();
        if (!imageData) {
            showToast('Upload an image before running a benchmark.', 'error');
            updateActionState();
            return;
        }

        const filter = filterSelect.value;
        const data = imageData.data;
        const length = data.length;
        const requiredPages = Math.ceil(length / (64 * 1024));
        const currentPages = wasmMemory.buffer.byteLength / (64 * 1024);

        if (currentPages < requiredPages) {
            wasmMemory.grow(requiredPages - currentPages);
        }

        const wasmArray = new Uint8Array(wasmMemory.buffer, 0, length);
        wasmArray.set(data);

        const t0 = performance.now();

        if (filter === 'invert') {
            wasmModule.invert(0, length);
        } else if (filter === 'grayscale') {
            wasmModule.grayscale(0, length);
        }

        const t1 = performance.now();
        data.set(wasmArray);
        putResultImageData(imageData);

        const timeTaken = t1 - t0;
        execTimeDisplay.innerText = `${timeTaken.toFixed(2)} ms`;
        setMethodBadge('wasm');
        runStatus.innerText = `WebAssembly completed ${filter} in ${timeTaken.toFixed(2)} ms.`;
        logPerformance('wasm', filter, timeTaken);
    });

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        themeToggleBtn.innerText = isDark ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('theme', theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        applyTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark');
    });

    if (localStorage.getItem('theme') === 'dark') {
        applyTheme('dark');
    }
});
