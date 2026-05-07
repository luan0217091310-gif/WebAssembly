document.addEventListener('DOMContentLoaded', async () => {
    const imageUpload = document.getElementById('image-upload');
    const filterSelect = document.getElementById('filter-select');
    const iterationsInput = document.getElementById('iterations-input');
    const btnJs = document.getElementById('btn-js');
    const btnWasm = document.getElementById('btn-wasm');
    const btnBenchmark = document.getElementById('btn-benchmark');
    const btnDownload = document.getElementById('btn-download');
    const btnClearLogs = document.getElementById('btn-clear-logs');
    const canvasOriginal = document.getElementById('canvas-original');
    const canvasResult = document.getElementById('canvas-result');
    const ctxOriginal = canvasOriginal.getContext('2d');
    const ctxResult = canvasResult.getContext('2d');
    const execTimeDisplay = document.getElementById('exec-time');
    const computeTimeDisplay = document.getElementById('compute-time');
    const totalTimeDisplay = document.getElementById('total-time');
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
    const originalDropZone = document.getElementById('original-drop-zone');
    const benchmarkSummary = document.getElementById('benchmark-summary');
    const jsAverageDisplay = document.getElementById('js-average');
    const wasmAverageDisplay = document.getElementById('wasm-average');
    const speedRatio = document.getElementById('speed-ratio');
    const chartJsBar = document.getElementById('chart-js-bar');
    const chartWasmBar = document.getElementById('chart-wasm-bar');

    const LOCAL_LOG_KEY = 'wasmDemoLocalLogs';

    let currentImage = null;
    let wasmModule = null;
    let wasmMemory = null;
    let hasResult = false;
    let lastResultMethod = '';
    let isWorking = false;

    // UI helpers
    function formatMs(value) {
        return `${Number(value || 0).toFixed(2)} ms`;
    }

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
        btnJs.disabled = isWorking || !hasImage;
        btnWasm.disabled = isWorking || !hasImage || !wasmModule;
        btnBenchmark.disabled = isWorking || !hasImage || !wasmModule;
        btnDownload.disabled = isWorking || !hasResult;
        btnClearLogs.disabled = isWorking;

        btnJs.title = hasImage ? '' : 'Upload an image first';
        btnWasm.title = !wasmModule ? 'WASM module is not ready' : btnJs.title;
        btnBenchmark.title = !wasmModule ? 'WASM module is required for side-by-side benchmark' : btnJs.title;
        btnDownload.title = hasResult ? '' : 'Process an image first';
    }

    function setWorkingState(working, message) {
        isWorking = working;
        if (message) {
            runStatus.innerText = message;
        }
        updateActionState();
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

    function updateLatestStats(result) {
        execTimeDisplay.innerText = formatMs(result.computeTimeMs);
        computeTimeDisplay.innerText = formatMs(result.computeTimeMs);
        totalTimeDisplay.innerText = formatMs(result.totalTimeMs);
        setMethodBadge(result.method);
        runStatus.innerText = `${result.method.toUpperCase()} ${result.filterType} completed. Compute: ${formatMs(result.computeTimeMs)}, total: ${formatMs(result.totalTimeMs)}.`;
    }

    function resetBenchmarkSummary() {
        jsAverageDisplay.innerText = '0 ms';
        wasmAverageDisplay.innerText = '0 ms';
        chartJsBar.style.width = '0%';
        chartWasmBar.style.width = '0%';
        benchmarkSummary.innerText = 'Run benchmark to compare average total time.';
        setStatusPill(speedRatio, 'idle', 'No benchmark');
    }

    function resetResultState() {
        hasResult = false;
        lastResultMethod = '';
        ctxResult.clearRect(0, 0, canvasResult.width, canvasResult.height);
        execTimeDisplay.innerText = '0 ms';
        computeTimeDisplay.innerText = '0 ms';
        totalTimeDisplay.innerText = '0 ms';
        setMethodBadge('');
        resetBenchmarkSummary();
        runStatus.innerText = 'Choose JS or WASM to process the uploaded image.';
        setImagePlaceholders(Boolean(currentImage), hasResult);
        updateActionState();
    }

    function renderLogState(message, className = 'log-empty') {
        const li = document.createElement('li');
        li.className = className;
        li.textContent = message;
        logsList.replaceChildren(li);
    }

    function updateBenchmarkChart(jsSummary, wasmSummary) {
        const jsAvg = jsSummary.totalTimeMs;
        const wasmAvg = wasmSummary.totalTimeMs;
        const maxAvg = Math.max(jsAvg, wasmAvg, 1);
        const jsWidth = Math.max(4, (jsAvg / maxAvg) * 100);
        const wasmWidth = Math.max(4, (wasmAvg / maxAvg) * 100);

        jsAverageDisplay.innerText = formatMs(jsAvg);
        wasmAverageDisplay.innerText = formatMs(wasmAvg);
        chartJsBar.style.width = `${jsWidth}%`;
        chartWasmBar.style.width = `${wasmWidth}%`;

        const safeJsAvg = Math.max(jsAvg, 0.01);
        const safeWasmAvg = Math.max(wasmAvg, 0.01);

        if (jsAvg > wasmAvg) {
            setStatusPill(speedRatio, 'ready', `WASM ${(safeJsAvg / safeWasmAvg).toFixed(2)}x faster`);
        } else if (wasmAvg > jsAvg) {
            setStatusPill(speedRatio, 'idle', `JS ${(safeWasmAvg / safeJsAvg).toFixed(2)}x faster`);
        } else {
            setStatusPill(speedRatio, 'idle', 'Same speed');
        }

        benchmarkSummary.innerText = `${jsSummary.iterations} runs, filter ${jsSummary.filterType}. JS avg total ${formatMs(jsAvg)}, WASM avg total ${formatMs(wasmAvg)}.`;
    }

    // Image helpers
    function getOriginalImageData() {
        if (!currentImage) {
            return null;
        }
        return ctxOriginal.getImageData(0, 0, canvasOriginal.width, canvasOriginal.height);
    }

    function putResultImageData(imageData, method) {
        ctxResult.putImageData(imageData, 0, 0);
        hasResult = true;
        lastResultMethod = method;
        setImagePlaceholders(true, true);
        updateActionState();
    }

    function downloadResultImage() {
        if (!hasResult) {
            showToast('Process an image before downloading the result.', 'error');
            return;
        }

        canvasResult.toBlob((blob) => {
            if (!blob) {
                showToast('Could not export the result image.', 'error');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `wasm-result-${lastResultMethod || 'image'}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    function loadImageFile(file) {
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            showToast('Please choose an image file.', 'error');
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
    }

    function handleDroppedImage(event) {
        event.preventDefault();
        originalDropZone.classList.remove('is-dragover');

        const file = event.dataTransfer.files[0];
        loadImageFile(file);
    }

    // Benchmark helpers
    function clampIterations() {
        const value = Number.parseInt(iterationsInput.value, 10);
        const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 1), 50) : 10;
        iterationsInput.value = safeValue;
        return safeValue;
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

    function applyJsFilter(data, filter) {
        if (filter === 'invert') {
            jsInvert(data);
        } else if (filter === 'grayscale') {
            jsGrayscale(data);
        }
    }

    function ensureWasmMemory(length) {
        const requiredPages = Math.max(1, Math.ceil(length / (64 * 1024)));
        const currentPages = wasmMemory.buffer.byteLength / (64 * 1024);

        if (currentPages < requiredPages) {
            wasmMemory.grow(requiredPages - currentPages);
        }
    }

    function applyWasmFilter(filter, length) {
        if (filter === 'invert') {
            wasmModule.invert(0, length);
        } else if (filter === 'grayscale') {
            wasmModule.grayscale(0, length);
        }
    }

    function runSingleBenchmark(method, filter, renderResult = false) {
        const imageData = getOriginalImageData();
        if (!imageData) {
            throw new Error('Upload an image before running a benchmark.');
        }
        if (method === 'wasm' && !wasmModule) {
            throw new Error('WASM module is not ready.');
        }

        const totalStart = performance.now();
        const data = imageData.data;
        const length = data.length;
        let computeStart;
        let computeEnd;

        if (method === 'js') {
            computeStart = performance.now();
            applyJsFilter(data, filter);
            computeEnd = performance.now();
        } else {
            ensureWasmMemory(length);
            const wasmArray = new Uint8Array(wasmMemory.buffer, 0, length);
            wasmArray.set(data);

            computeStart = performance.now();
            applyWasmFilter(filter, length);
            computeEnd = performance.now();

            data.set(wasmArray);
        }

        if (renderResult) {
            putResultImageData(imageData, method);
        }

        const totalEnd = performance.now();
        const computeTimeMs = computeEnd - computeStart;
        const totalTimeMs = totalEnd - totalStart;

        return {
            method,
            filterType: filter,
            executionTimeMs: computeTimeMs,
            computeTimeMs,
            totalTimeMs,
            width: imageData.width,
            height: imageData.height,
            pixelCount: imageData.width * imageData.height,
            iterations: 1
        };
    }

    function summarizeRuns(runs, method, iterations) {
        const computeTimes = runs.map((run) => run.computeTimeMs);
        const totalTimes = runs.map((run) => run.totalTimeMs);
        const sum = (values) => values.reduce((total, value) => total + value, 0);
        const firstRun = runs[0];

        return {
            method,
            filterType: firstRun.filterType,
            executionTimeMs: sum(computeTimes) / computeTimes.length,
            computeTimeMs: sum(computeTimes) / computeTimes.length,
            totalTimeMs: sum(totalTimes) / totalTimes.length,
            minTotalTimeMs: Math.min(...totalTimes),
            maxTotalTimeMs: Math.max(...totalTimes),
            width: firstRun.width,
            height: firstRun.height,
            pixelCount: firstRun.pixelCount,
            iterations
        };
    }

    async function runRepeatedBenchmark() {
        const iterations = clampIterations();
        const filter = filterSelect.value;
        const jsRuns = [];
        const wasmRuns = [];

        setWorkingState(true, `Running ${iterations} JS runs and ${iterations} WASM runs...`);

        try {
            for (let i = 0; i < iterations; i += 1) {
                jsRuns.push(runSingleBenchmark('js', filter, false));
            }
            for (let i = 0; i < iterations; i += 1) {
                wasmRuns.push(runSingleBenchmark('wasm', filter, false));
            }

            const jsSummary = summarizeRuns(jsRuns, 'js', iterations);
            const wasmSummary = summarizeRuns(wasmRuns, 'wasm', iterations);
            const renderedResult = runSingleBenchmark('wasm', filter, true);

            updateLatestStats(renderedResult);
            updateBenchmarkChart(jsSummary, wasmSummary);
            await logPerformance(jsSummary);
            await logPerformance(wasmSummary);
            showToast('Benchmark completed. Averages were logged.', 'success');
        } catch (error) {
            console.error('Benchmark failed', error);
            showToast(error.message, 'error');
        } finally {
            setWorkingState(false);
        }
    }

    // Log helpers
    function toLogPayload(result) {
        return {
            method: result.method,
            filter_type: result.filterType,
            execution_time_ms: result.executionTimeMs,
            compute_time_ms: result.computeTimeMs,
            total_time_ms: result.totalTimeMs,
            width: result.width,
            height: result.height,
            pixel_count: result.pixelCount,
            iterations: result.iterations || 1
        };
    }

    function getLocalLogs() {
        try {
            const storedLogs = JSON.parse(localStorage.getItem(LOCAL_LOG_KEY) || '[]');
            return Array.isArray(storedLogs) ? storedLogs : [];
        } catch (error) {
            console.error('Failed to read local logs', error);
            return [];
        }
    }

    function saveLocalLog(log) {
        const logs = getLocalLogs();
        logs.unshift({
            ...log,
            created_at: new Date().toISOString(),
            source: 'local'
        });
        localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(logs.slice(0, 30)));
    }

    function clearLocalLogs() {
        localStorage.removeItem(LOCAL_LOG_KEY);
    }

    function renderLogs(logs, emptyMessage) {
        logsList.replaceChildren();

        if (!logs.length) {
            renderLogState(emptyMessage);
            return;
        }

        logs.forEach((log) => {
            const method = log.method || 'unknown';
            const filter = log.filter_type || log.filterType || 'filter';
            const compute = Number(log.compute_time_ms ?? log.computeTimeMs ?? log.execution_time_ms ?? 0);
            const total = Number(log.total_time_ms ?? log.totalTimeMs ?? log.execution_time_ms ?? compute);
            const iterations = Number(log.iterations || 1);
            const dimensions = log.width && log.height ? ` | ${log.width}x${log.height}` : '';

            const li = document.createElement('li');
            li.className = method === 'wasm' ? 'log-entry log-wasm' : 'log-entry log-js';

            const main = document.createElement('div');
            main.className = 'log-main';

            const methodPill = document.createElement('span');
            methodPill.className = 'log-method';
            methodPill.textContent = method.toUpperCase();

            const details = document.createElement('div');
            details.className = 'log-details';

            const title = document.createElement('span');
            title.className = 'log-title';
            title.textContent = `${filter} filter`;

            const meta = document.createElement('span');
            meta.className = 'log-meta';
            meta.textContent = `${iterations} run${iterations > 1 ? 's' : ''}${dimensions}`;

            const times = document.createElement('div');
            times.className = 'log-times';

            const computeNode = document.createElement('div');
            computeNode.className = 'log-time';
            computeNode.innerHTML = `<span>Compute</span><strong>${formatMs(compute)}</strong>`;

            const totalNode = document.createElement('div');
            totalNode.className = 'log-time';
            totalNode.innerHTML = `<span>Total</span><strong>${formatMs(total)}</strong>`;

            details.appendChild(title);
            details.appendChild(meta);
            main.appendChild(methodPill);
            main.appendChild(details);
            times.appendChild(computeNode);
            times.appendChild(totalNode);
            li.appendChild(main);
            li.appendChild(times);
            logsList.appendChild(li);
        });
    }

    async function logPerformance(result) {
        const payload = toLogPayload(result);

        try {
            const response = await fetch(BASE_URL + 'index.php?url=log/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Log request failed with ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Database rejected the log');
            }

            fetchLogs();
        } catch (error) {
            console.error('Failed to log performance result', error);
            saveLocalLog(payload);
            renderLogs(getLocalLogs(), 'No local logs yet.');
            setStatusPill(logsStatus, 'idle', 'Local');
            showToast('Database unavailable; saved this result in browser storage.', 'error');
        }
    }

    async function fetchLogs() {
        setStatusPill(logsStatus, 'loading', 'Loading');
        renderLogState('Loading logs...');

        try {
            const response = await fetch(BASE_URL + 'index.php?url=log/get');
            if (!response.ok) {
                throw new Error(`Log request failed with ${response.status}`);
            }

            const data = await response.json();
            const databaseLogs = data.logs || [];
            const localLogs = getLocalLogs();

            if (databaseLogs.length > 0) {
                renderLogs(databaseLogs, 'No logs yet.');
                setStatusPill(logsStatus, 'ready', 'Database');
            } else if (localLogs.length > 0) {
                renderLogs(localLogs, 'No local logs yet.');
                setStatusPill(logsStatus, 'idle', 'Local');
            } else {
                renderLogState('No logs yet.');
                setStatusPill(logsStatus, 'idle', 'Empty');
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
            const localLogs = getLocalLogs();

            if (localLogs.length > 0) {
                renderLogs(localLogs, 'No local logs yet.');
                setStatusPill(logsStatus, 'idle', 'Local');
            } else {
                renderLogState('Logs unavailable. Database is offline and browser storage is empty.', 'log-error');
                setStatusPill(logsStatus, 'error', 'Offline');
            }
        }
    }

    async function clearAllLogs() {
        setWorkingState(true, 'Clearing logs...');
        clearLocalLogs();

        try {
            const response = await fetch(BASE_URL + 'index.php?url=log/clear', { method: 'POST' });
            if (!response.ok) {
                throw new Error(`Clear request failed with ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Database clear failed');
            }

            showToast('Logs cleared.', 'success');
        } catch (error) {
            console.error('Failed to clear database logs', error);
            showToast('Local logs cleared. Database clear request failed.', 'error');
        } finally {
            await fetchLogs();
            runStatus.innerText = 'Logs cleared. Current image and result remain available.';
            setWorkingState(false);
        }
    }

    // Event handlers
    imageUpload.addEventListener('change', (event) => {
        loadImageFile(event.target.files[0]);
    });

    originalDropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        originalDropZone.classList.add('is-dragover');
    });

    originalDropZone.addEventListener('dragleave', () => {
        originalDropZone.classList.remove('is-dragover');
    });

    originalDropZone.addEventListener('drop', handleDroppedImage);

    btnJs.addEventListener('click', async () => {
        setWorkingState(true, 'Running Pure JS once...');
        try {
            const result = runSingleBenchmark('js', filterSelect.value, true);
            updateLatestStats(result);
            await logPerformance(result);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setWorkingState(false);
        }
    });

    btnWasm.addEventListener('click', async () => {
        setWorkingState(true, 'Running WebAssembly once...');
        try {
            const result = runSingleBenchmark('wasm', filterSelect.value, true);
            updateLatestStats(result);
            await logPerformance(result);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setWorkingState(false);
        }
    });

    btnBenchmark.addEventListener('click', runRepeatedBenchmark);
    btnDownload.addEventListener('click', downloadResultImage);
    btnClearLogs.addEventListener('click', clearAllLogs);

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        themeToggleBtn.innerText = isDark ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('theme', theme);
    }

    themeToggleBtn.addEventListener('click', () => {
        applyTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark');
    });

    setImagePlaceholders(false, false);
    updateActionState();
    setWasmStatus('loading', 'Loading WASM');

    try {
        const response = await fetch(BASE_URL + 'wasm/image_processing.wasm');
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

    if (localStorage.getItem('theme') === 'dark') {
        applyTheme('dark');
    }

    fetchLogs();
});
