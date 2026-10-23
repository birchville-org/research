import http.server
import socketserver
import os

PORT = 4173
DIRECTORY = "/Volumes/SanDisk1TB/proj/birchville-blog/docs/.vitepress/dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def guess_type(self, path):
        if path.endswith(".xml"):
            return "application/xml; charset=utf-8"
        return super().guess_type(path)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
