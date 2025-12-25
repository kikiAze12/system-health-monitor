// dashboard.js

// Cyberpunk Chart Configuration
Chart.defaults.font.family = "'Orbitron', monospace";
Chart.defaults.color = '#7aa0cd';
Chart.defaults.borderColor = 'rgba(0, 243, 255, 0.1)';

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 0 // Disable animation for "real-time" feel, or keep low
    },
    elements: {
        line: {
            tension: 0.4, // Smooth bezier curves
            borderWidth: 2,
            borderJoinStyle: 'round'
        },
        point: {
            radius: 0 // Hide points
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            grid: {
                color: 'rgba(0, 243, 255, 0.05)'
            },
            ticks: {
                callback: function (value) { return value + '%'; }
            }
        },
        x: {
            display: false,
            grid: { display: false }
        }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(5, 8, 20, 0.9)',
            titleColor: '#00f3ff',
            bodyColor: '#e0f0ff',
            borderColor: '#00f3ff',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
                label: function (context) {
                    return context.parsed.y + '%';
                }
            }
        }
    }
};

// Gradient Config
function getGradient(ctx, colorStart, colorEnd) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
}

// Initialize CPU Chart
const ctxCpu = document.getElementById('cpuChart').getContext('2d');
const cpuGradient = getGradient(ctxCpu, 'rgba(0, 243, 255, 0.4)', 'rgba(0, 243, 255, 0)');
const cpuChart = new Chart(ctxCpu, {
    type: 'line',
    data: {
        labels: Array(30).fill(''),
        datasets: [{
            label: 'CPU',
            data: Array(30).fill(0),
            borderColor: '#00f3ff',
            backgroundColor: cpuGradient,
            fill: true
        }]
    },
    options: commonChartOptions
});

// Initialize Memory Chart
const ctxMem = document.getElementById('memoryChart').getContext('2d');
const memGradient = getGradient(ctxMem, 'rgba(189, 0, 255, 0.4)', 'rgba(189, 0, 255, 0)');
const memoryChart = new Chart(ctxMem, {
    type: 'line',
    data: {
        labels: Array(30).fill(''),
        datasets: [{
            label: 'MEM',
            data: Array(30).fill(0),
            borderColor: '#bd00ff',
            backgroundColor: memGradient,
            fill: true
        }]
    },
    options: commonChartOptions
});

// Initialize Network Charts
const ctxNetSent = document.getElementById('netSentChart').getContext('2d');
const netSentGradient = getGradient(ctxNetSent, 'rgba(0, 243, 255, 0.4)', 'rgba(0, 243, 255, 0)');
const netSentChart = new Chart(ctxNetSent, {
    type: 'line',
    data: {
        labels: Array(30).fill(''),
        datasets: [{
            label: 'UPLOAD KB/s',
            data: Array(30).fill(0),
            borderColor: '#00f3ff',
            backgroundColor: netSentGradient,
            fill: true
        }]
    },
    options: commonChartOptions
});

const ctxNetRecv = document.getElementById('netRecvChart').getContext('2d');
const netRecvGradient = getGradient(ctxNetRecv, 'rgba(255, 0, 85, 0.4)', 'rgba(255, 0, 85, 0)');
const netRecvChart = new Chart(ctxNetRecv, {
    type: 'line',
    data: {
        labels: Array(30).fill(''),
        datasets: [{
            label: 'DOWNLOAD KB/s',
            data: Array(30).fill(0),
            borderColor: '#ff0055',
            backgroundColor: netRecvGradient,
            fill: true
        }]
    },
    options: commonChartOptions
});

// View Switching Logic
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');

    // Show selected view
    document.getElementById('view-' + viewName).style.display = 'block';

    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + viewName).classList.add('active');
}

// System Log Logic
const logMessages = [
    "SCANNING SECTOR 7G...",
    "VERIFYING INTEGRITY...",
    "PACKET TRACE COMPLETE",
    "DAEMON RUNNING",
    "ENCRYPTING TRAFFIC...",
    "UPDATING LOCAL FLUSH...",
    "PING: 12ms",
    "KERNEL HEARTBEAT: OK",
    "OPTIMIZING CACHE...",
    "SYNCING WITH MAIN DISFRAME..."
];

function logSystemMessage(msg) {
    const logContainer = document.getElementById('system-log');
    if (!logContainer) return; // Guard clause if element doesn't exist in current view

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

    // Random message if none provided
    const text = msg || logMessages[Math.floor(Math.random() * logMessages.length)];

    entry.innerHTML = `<span class="timestamp">[${timeStr}]</span> ${text}`;
    logContainer.appendChild(entry);

    // Auto scroll
    logContainer.scrollTop = logContainer.scrollHeight;

    // Limit entries
    if (logContainer.children.length > 20) {
        logContainer.removeChild(logContainer.firstChild);
    }
}

// Uptime Counter
let uptimeSeconds = 15420; // Simulated start time
function updateUptime() {
    uptimeSeconds++;
    const date = new Date(0);
    date.setSeconds(uptimeSeconds);
    const timeString = date.toISOString().substr(11, 8);
    document.getElementById('uptime').innerText = timeString;
}

// State for Network Speed Calculation
let lastBytesSent = 0;
let lastBytesRecv = 0;
let firstRun = true;

// Main Update Loop
function updateDashboard() {
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            // Update Text Values (Dashboard)
            document.getElementById('cpu-value').innerText = data.cpu + '%';
            document.getElementById('memory-value').innerText = data.memory + '%';
            document.getElementById('disk-value').innerText = data.disk + '%';

            const diskBar = document.getElementById('disk-bar');
            diskBar.style.width = data.disk + '%';

            // Color change for high usage
            if (data.cpu > 80) document.getElementById('cpu-value').style.color = '#ff0055';
            else document.getElementById('cpu-value').style.color = '#00f3ff';

            // Calculate Network Speed (Bytes diff / 1 sec)
            let speedSent = 0;
            let speedRecv = 0;

            if (!firstRun) {
                speedSent = (data.net_sent - lastBytesSent) / 1024; // KB/s
                speedRecv = (data.net_recv - lastBytesRecv) / 1024; // KB/s
            }

            lastBytesSent = data.net_sent;
            lastBytesRecv = data.net_recv;
            firstRun = false;

            // Update Network Text
            document.getElementById('net-sent-value').innerText = speedSent.toFixed(1) + ' KB/s';
            document.getElementById('net-recv-value').innerText = speedRecv.toFixed(1) + ' KB/s';

            // Update Charts
            const cpuData = cpuChart.data.datasets[0].data;
            cpuData.shift();
            cpuData.push(data.cpu);
            cpuChart.update('none');

            const memData = memoryChart.data.datasets[0].data;
            memData.shift();
            memData.push(data.memory);
            memoryChart.update('none');

            const sentData = netSentChart.data.datasets[0].data;
            sentData.shift();
            sentData.push(speedSent);
            netSentChart.update('none');

            const recvData = netRecvChart.data.datasets[0].data;
            recvData.shift();
            recvData.push(speedRecv);
            netRecvChart.update('none');
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Random log generator
setInterval(() => {
    if (Math.random() > 0.7) logSystemMessage();
    if (Math.random() > 0.9) {
        const securityLogs = [
            "SCANNING FOR INTRUSIONS...",
            "SSL ENCRYPTION RE-VERIFIED",
            "FIREWALL HEARTBEAT: OK",
            "MD5 CHECKSUM VALIDATED",
            "PORT SCAN DETECTED: BLOCKED"
        ];
        const logContent = securityLogs[Math.floor(Math.random() * securityLogs.length)];
        const securityContainer = document.getElementById('security-log');
        if (securityContainer) {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
            entry.innerHTML = `<span class="timestamp">[${timeStr}]</span> ${logContent}`;
            securityContainer.appendChild(entry);
            securityContainer.scrollTop = securityContainer.scrollHeight;
            if (securityContainer.children.length > 20) securityContainer.removeChild(securityContainer.firstChild);
        }
    }
}, 2000);

// Start everything
setInterval(updateDashboard, 1000);
setInterval(updateUptime, 1000);
logSystemMessage("SYSTEM INITIALIZED");
updateDashboard();
