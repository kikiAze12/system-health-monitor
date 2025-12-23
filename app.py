import psutil
from flask import Flask, jsonify, render_template_string

app = Flask(__name__)

# Simple HTML dashboard template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>System Health Monitor</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #222; color: #0f0; }
        .card { border: 1px solid #444; padding: 20px; margin: 10px; display: inline-block; width: 200px; }
        h1 { color: #fff; }
        .value { font-size: 2em; font-weight: bold; }
        .label { color: #888; }
    </style>
    <script>
        function refresh() {
            window.location.reload();
        }
        setInterval(refresh, 5000); // Auto-refresh every 5 seconds
    </script>
</head>
<body>
    <h1>System Health Status</h1>
    <div class="card">
        <div class="label">CPU Usage</div>
        <div class="value">{{ cpu }}%</div>
    </div>
    <div class="card">
        <div class="label">Memory Usage</div>
        <div class="value">{{ memory }}%</div>
    </div>
    <div class="card">
        <div class="label">Disk Usage</div>
        <div class="value">{{ disk }}%</div>
    </div>
</body>
</html>
"""

@app.route('/')
def home():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return render_template_string(HTML_TEMPLATE, cpu=cpu, memory=memory, disk=disk)

@app.route('/health')
def health():
    return jsonify(
        cpu=psutil.cpu_percent(interval=1),
        memory=psutil.virtual_memory().percent,
        disk=psutil.disk_usage('/').percent
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
