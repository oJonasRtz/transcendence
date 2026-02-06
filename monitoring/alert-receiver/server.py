from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import sys


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/healthz"):
            self.send_response(200)
            self.send_header("content-type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"ok\n")
            return

        self.send_response(404)
        self.send_header("content-type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"not found\n")

    def do_POST(self):
        if not self.path.startswith("/alerts"):
            self.send_response(404)
            self.send_header("content-type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"not found\n")
            return

        length = int(self.headers.get("content-length", "0"))
        raw = self.rfile.read(length) if length > 0 else b""

        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            payload = {"_parse_error": True, "raw": raw.decode("utf-8", errors="replace")}

        # Print a compact line to container logs for easy verification.
        # Alertmanager sends either {"alerts":[...], ...} or similar payloads depending on version/config.
        alerts = payload.get("alerts") if isinstance(payload, dict) else None
        count = len(alerts) if isinstance(alerts, list) else 0
        print(f"alert-receiver: received {count} alerts", flush=True)
        if isinstance(alerts, list):
            for a in alerts[:20]:
                labels = a.get("labels", {})
                status = a.get("status")
                name = labels.get("alertname", "unknown")
                job = labels.get("job", "unknown")
                instance = labels.get("instance", "unknown")
                print(f"- {status} {name} job={job} instance={instance}", flush=True)

        self.send_response(200)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(b'{"ok":true}\n')

    def log_message(self, fmt, *args):
        # Silence default noisy request logging; we print our own lines above.
        return


def main():
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8080"))
    httpd = HTTPServer((host, port), Handler)
    print(f"alert-receiver: listening on http://{host}:{port}", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())

