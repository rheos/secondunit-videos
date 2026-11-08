"""Static server for the design studies: serves the project folder, and PUT /save/<name> writes design/out/<name>.
   python3 design/serve.py [port=8796]"""
import http.server, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "design" / "out"

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(ROOT), **k)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
    def do_PUT(self):
        m = re.fullmatch(r"/save/([A-Za-z0-9._-]+\.(?:jpg|png))", self.path)
        if not m: self.send_error(400); return
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / m.group(1)).write_bytes(self.rfile.read(int(self.headers["Content-Length"])))
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
    def log_message(self, *a): pass

http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8796), H).serve_forever()
