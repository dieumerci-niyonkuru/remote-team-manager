from http.server import HTTPServer, BaseHTTPRequestHandler
import os

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"status":"ok","message":"alive"}')

port = int(os.environ.get('PORT', 8000))
HTTPServer(('0.0.0.0', port), Handler).serve_forever()
