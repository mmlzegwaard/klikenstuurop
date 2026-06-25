#!/usr/bin/env python3
import argparse
import json
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent
CREDENTIALS_FILE = REPO_ROOT / "hortos_credentials.json"


def read_json_body(response):
    raw = response.read()
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))


def json_response(handler, payload, status=200):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def load_credentials():
    if not CREDENTIALS_FILE.exists():
        raise RuntimeError(
            "Bestand hortos_credentials.json ontbreekt. "
            "Kopieer hortos_credentials.example.json naar hortos_credentials.json en vul je gegevens in."
        )

    data = json.loads(CREDENTIALS_FILE.read_text(encoding="utf-8"))
    required = ["base_url", "username", "password", "auth_endpoint", "key_endpoint"]
    missing = [name for name in required if not data.get(name)]
    if missing:
        raise RuntimeError(f"Ontbrekende velden in hortos_credentials.json: {', '.join(missing)}")
    return data


def fetch_api_key(credentials):
    base_url = credentials["base_url"].rstrip("/")
    auth_url = urllib.parse.urljoin(f"{base_url}/", credentials["auth_endpoint"].lstrip("/"))
    key_url = urllib.parse.urljoin(f"{base_url}/", credentials["key_endpoint"].lstrip("/"))
    timeout_seconds = float(credentials.get("timeout_seconds", 10))
    timeout_seconds = max(1.0, min(timeout_seconds, 30.0))

    auth_payload = {
        "username": credentials["username"],
        "password": credentials["password"],
    }
    auth_request = urllib.request.Request(
        auth_url,
        data=json.dumps(auth_payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(auth_request, timeout=timeout_seconds) as response:
        auth_data = read_json_body(response)

    token_field = credentials.get("access_token_field", "access_token")
    token = auth_data.get(token_field) or auth_data.get("token")
    if not token:
        raise RuntimeError(
            f"Geen token gevonden in login response (verwacht veld '{token_field}' of 'token')."
        )

    key_request = urllib.request.Request(
        key_url,
        headers={"Authorization": "Bearer " + token, "Accept": "application/json"},
        method="GET",
    )
    with urllib.request.urlopen(key_request, timeout=timeout_seconds) as response:
        key_data = read_json_body(response)

    api_key_field = credentials.get("api_key_field", "api_key")
    api_key = key_data.get(api_key_field) or key_data.get("key")
    if not api_key:
        raise RuntimeError(
            f"Geen API key gevonden in key response (verwacht veld '{api_key_field}' of 'key')."
        )
    return api_key


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

    def do_GET(self):
        if self.path != "/api/key":
            return super().do_GET()

        try:
            credentials = load_credentials()
            api_key = fetch_api_key(credentials)
            return json_response(self, {"api_key": api_key}, status=200)
        except urllib.error.HTTPError as exc:
            return json_response(
                self,
                {"error": f"Hortos request mislukt ({exc.code})."},
                status=502,
            )
        except urllib.error.URLError as exc:
            return json_response(
                self,
                {"error": "Verbinding met hortos.ridder.com mislukt.", "details": str(exc.reason)},
                status=502,
            )
        except Exception as exc:
            return json_response(self, {"error": str(exc)}, status=500)


def main():
    parser = argparse.ArgumentParser(description="Lokale server voor Hortos API key ophalen.")
    parser.add_argument("--host", default="127.0.0.1", help="Luisterhost voor de lokale server.")
    parser.add_argument("--port", type=int, default=8000, help="Luisterpoort voor de lokale server.")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"Server gestart op http://{args.host}:{args.port}")
    print(f"Open: http://{args.host}:{args.port}/index.html")
    server.serve_forever()


if __name__ == "__main__":
    main()
