from __future__ import annotations

import json
import sys
import traceback
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from downloader_core import (  # noqa: E402
    DownloadSettings,
    download_urls,
    normalize_format_selector,
    normalize_merge_output_format,
    normalize_referrer,
    normalize_thumbnail_url,
)


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def main() -> int:
    raw = sys.stdin.read()
    if not raw.strip():
        emit({"type": "error", "message": "Missing task payload."})
        return 1

    try:
        task = json.loads(raw)
    except json.JSONDecodeError as exc:
        emit({"type": "error", "message": f"Invalid task payload: {exc.msg}."})
        return 1

    if not isinstance(task, dict):
        emit({"type": "error", "message": "Task payload must be an object."})
        return 1

    urls = task.get("urls") or []
    if not urls:
        emit({"type": "error", "message": "No URLs provided."})
        return 1

    output_dir = str(task.get("outputDir") or "").strip()
    if not output_dir:
        emit({"type": "error", "message": "Missing output directory."})
        return 1

    try:
        settings = DownloadSettings(
            output_dir=Path(output_dir),
            resolution=task.get("resolution", "best"),
            playlist=bool(task.get("playlist")),
            audio_only=bool(task.get("audioOnly")),
            cookie_file=Path(task["cookieFile"]) if task.get("cookieFile") else None,
            js_runtime=task.get("jsRuntime", "auto"),
            js_runtime_path=Path(task["jsRuntimePath"]) if task.get("jsRuntimePath") else None,
            ffmpeg_location=Path(task["ffmpegLocation"]) if task.get("ffmpegLocation") else None,
            format_selector=normalize_format_selector(task.get("formatId")),
            merge_output_format=normalize_merge_output_format(task.get("mergeOutputFormat")),
            referrer=normalize_referrer(task.get("referrer")),
            thumbnail_url=normalize_thumbnail_url(task.get("thumbnailUrl")),
            asset_type=str(task.get("assetType") or ("audio" if task.get("audioOnly") else "video")),
            asset_role=str(task.get("assetRole") or "").strip(),
            subtitle_language=str(task.get("subtitleLanguage") or "").strip() or None,
            subtitle_automatic=bool(task.get("subtitleAutomatic")),
            title=str(task.get("title") or task.get("fileName") or "Untitled"),
            media_id=str(task.get("mediaId") or ""),
        )
    except (TypeError, ValueError) as exc:
        emit({"type": "error", "message": str(exc)})
        return 1

    def log(message: str) -> None:
        emit({"type": "log", "message": message})

    def progress(data: dict) -> None:
        emit({"type": "progress", "data": data})

    try:
        downloaded, failed = download_urls(urls, settings, log, progress)
        emit({"type": "done", "downloaded": downloaded, "failed": failed})
        return 0
    except Exception as exc:
        emit(
            {
                "type": "error",
                "message": str(exc),
                "traceback": traceback.format_exc(),
            }
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
