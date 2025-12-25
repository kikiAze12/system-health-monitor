import os
import psutil
from flask import Flask, jsonify, render_template
from flask_basicauth import BasicAuth
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Security Configuration
app.config['BASIC_AUTH_USERNAME'] = os.getenv('BASIC_AUTH_USERNAME', 'admin')
app.config['BASIC_AUTH_PASSWORD'] = os.getenv('BASIC_AUTH_PASSWORD', 'password')
app.config['BASIC_AUTH_FORCE'] = False # Only protect specific routes

basic_auth = BasicAuth(app)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Enforce security headers but disable HTTPS redirect for local development
Talisman(app, content_security_policy=None, force_https=False) 

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/health')
@basic_auth.required
@limiter.limit("5 per minute")
def health():
    net_io = psutil.net_io_counters()
    return jsonify(
        cpu=psutil.cpu_percent(interval=1),
        memory=psutil.virtual_memory().percent,
        disk=psutil.disk_usage('.').percent,
        net_sent=net_io.bytes_sent,
        net_recv=net_io.bytes_recv
    )

if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host=host, port=port, debug=debug)
