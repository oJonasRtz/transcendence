import os
from pathlib import Path
from secrets import token_urlsafe


def ensure_file(path: str, content: str) -> None:
    file_path = Path(path)
    if file_path.exists():
        return
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")


def main() -> None:
    root_env = Path(".env")
    if not root_env.exists():
        jwt_secret = token_urlsafe(48)
        public_domain = os.environ.get("PUBLIC_DOMAIN", "localhost")
        grafana_root_url = os.environ.get("GRAFANA_ROOT_URL", "https://localhost/grafana/")
        ensure_file(
            ".env",
            (
                f"JWT_SECRET={jwt_secret}\n"
                f"PUBLIC_DOMAIN={public_domain}\n"
                f"GRAFANA_ROOT_URL={grafana_root_url}\n"
            ),
        )

    ensure_file("monitoring/.grafana-password.txt", f"GRAFANA_ADMIN_PASSWORD={token_urlsafe(32)}\n")

    match_env = Path("new-match-service/.env")
    if not match_env.exists():
        lobby_pass = token_urlsafe(24)
        cookie_secret = token_urlsafe(48)
        ensure_file(
            "new-match-service/.env",
            (
                "PORT=3010\n"
                "PORT_LOBBY=8443\n"
                "IP_LOBBY=game-server\n"
                "LOBBY_ID=1\n"
                f"LOBBY_PASS={lobby_pass}\n"
                f"COOKIE_SECRET={cookie_secret}\n"
            ),
        )


if __name__ == "__main__":
    main()

