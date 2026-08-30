from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.metadata_core import create_media_candidates  # noqa: E402


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False), flush=True)


class QuietLogger:
    def debug(self, _message: str) -> None:
        pass

    info = debug
    warning = debug
    error = debug


def main() -> int:
    try:
        task = json.loads(sys.stdin.read())
        if not isinstance(task, dict):
            raise ValueError("Metadata task payload must be an object.")
        page_url = str(task.get("pageUrl") or "").strip()
        parsed = urlparse(page_url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Metadata task requires an HTTP(S) page URL.")
        web_contents_id = int(task.get("webContentsId") or 0)
        if web_contents_id <= 0:
            raise ValueError("Metadata task requires a webContents id.")
        provider = str(task.get("provider") or "").strip().lower() or None
        js_runtime_path = str(task.get("jsRuntimePath") or "").strip()
        cookie_value = str(task.get("cookieFile") or "").strip()
        cookie_file = Path(cookie_value) if cookie_value else None

        from yt_dlp import YoutubeDL

        options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "noplaylist": True,
            "logger": QuietLogger(),
        }
        if cookie_file and cookie_file.exists():
            options["cookiefile"] = str(cookie_file)
        if js_runtime_path:
            options["js_runtimes"] = {"node": {"path": js_runtime_path}}
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(page_url, download=False)
        if not isinstance(info, dict):
            raise RuntimeError("yt-dlp returned no page metadata.")
        emit({"ok": True, "candidates": create_media_candidates(info, page_url, web_contents_id, provider)})
        return 0
    except Exception as exc:
        emit({"ok": False, "error": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
