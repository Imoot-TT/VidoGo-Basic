from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import shutil
import sys
from typing import Callable, Iterable


DEFAULT_ARCHIVE_NAME = ".download-archive.txt"
ProgressCallback = Callable[[dict], None]
LogCallback = Callable[[str], None]
TranslateCallback = Callable[..., str]


class DownloadCancelled(RuntimeError):
    pass


@dataclass(slots=True)
class DownloadSettings:
    output_dir: Path
    resolution: str = "2160"
    playlist: bool = False
    audio_only: bool = False
    cookies_from_browser: str | None = None
    cookie_file: Path | None = None
    js_runtime: str = "auto"
    archive_file: Path | None = None
    ffmpeg_location: Path | None = None
    retries: int = 10
    concurrent_fragments: int = 4


def normalize_resolution(value: str) -> str:
    if value == "best":
        return value
    if not value.isdigit():
        raise ValueError("Resolution must be 'best' or a number such as 2160, 1440, or 1080.")
    return value


def load_urls_from_text(raw_text: str) -> list[str]:
    urls: list[str] = []
    for raw_line in raw_text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        urls.append(line)
    return list(dict.fromkeys(urls))


def load_urls_from_file(file_path: Path) -> list[str]:
    if not file_path.exists():
        raise FileNotFoundError(f"URL file not found: {file_path}")
    return load_urls_from_text(file_path.read_text(encoding="utf-8"))


def resolve_archive_file(output_dir: Path, user_value: Path | None) -> Path:
    return user_value or output_dir / DEFAULT_ARCHIVE_NAME


def ensure_ffmpeg_available(ffmpeg_location: Path | None) -> bool:
    if ffmpeg_location:
        ffmpeg_bin = ffmpeg_location / ("ffmpeg.exe" if sys.platform.startswith("win") else "ffmpeg")
        return ffmpeg_bin.exists()
    return shutil.which("ffmpeg") is not None


def build_format_selector(audio_only: bool, resolution: str) -> str:
    if audio_only:
        return "bestaudio/best"
    if resolution == "best":
        return "bestvideo*+bestaudio/bestvideo+bestaudio/best"
    return f"bestvideo[height<={resolution}]+bestaudio/best[height<={resolution}]/best"


def human_size(value: float | None) -> str:
    if not value or value <= 0:
        return "-"
    units = ["B/s", "KB/s", "MB/s", "GB/s"]
    size = float(value)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f} {unit}"
        size /= 1024
    return "-"


def human_eta(value: float | None) -> str:
    if value is None or value < 0:
        return "-"
    seconds = int(value)
    minutes, sec = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{sec:02d}"
    return f"{minutes:02d}:{sec:02d}"


def _text(translate: TranslateCallback | None, key: str, **kwargs: object) -> str:
    if translate:
        return translate(key, **kwargs)

    defaults = {
        "error_missing_dependency": "Missing dependency: yt-dlp. Run `python -m pip install -r requirements.txt` first.",
        "error_no_urls": "No valid URLs to download.",
        "warning_ffmpeg_missing": "Warning: ffmpeg was not found. 4K downloads usually need ffmpeg to merge streams.",
        "download_cancelled": "Download cancelled.",
        "download_start": "[{index}/{total}] Starting: {url}",
        "download_finished": "[{index}/{total}] Finished: {name}",
    }
    return defaults[key].format(**kwargs)


def download_urls(
    urls: Iterable[str],
    settings: DownloadSettings,
    log: LogCallback,
    progress: ProgressCallback,
    should_cancel: Callable[[], bool] | None = None,
    translate: TranslateCallback | None = None,
) -> tuple[int, int]:
    try:
        from yt_dlp import YoutubeDL
    except ImportError as exc:
        raise RuntimeError(_text(translate, "error_missing_dependency")) from exc

    normalized_urls = list(dict.fromkeys(url.strip() for url in urls if url.strip()))
    if not normalized_urls:
        raise ValueError(_text(translate, "error_no_urls"))

    settings.output_dir.mkdir(parents=True, exist_ok=True)
    archive_file = resolve_archive_file(settings.output_dir, settings.archive_file)
    ffmpeg_available = ensure_ffmpeg_available(settings.ffmpeg_location)

    if not settings.audio_only and not ffmpeg_available:
        log(_text(translate, "warning_ffmpeg_missing"))

    ydl_opts = {
        "paths": {"home": str(settings.output_dir)},
        "outtmpl": {
            "default": "%(uploader)s/%(upload_date)s - %(title)s [%(id)s].%(ext)s",
            "chapter": "%(uploader)s/%(upload_date)s - %(title)s [%(id)s]/%(section_number)02d - %(section_title)s.%(ext)s",
        },
        "format": build_format_selector(settings.audio_only, normalize_resolution(settings.resolution)),
        "noplaylist": not settings.playlist,
        "ignoreerrors": True,
        "retries": settings.retries,
        "continuedl": True,
        "concurrent_fragment_downloads": max(1, settings.concurrent_fragments),
        "download_archive": str(archive_file),
        "windowsfilenames": False,
        "restrictfilenames": False,
        "merge_output_format": "mp4",
        "format_sort": ["res"] if settings.resolution == "best" else [f"res:{settings.resolution}"],
    }

    if settings.audio_only:
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }
        ]

    if settings.ffmpeg_location:
        ydl_opts["ffmpeg_location"] = str(settings.ffmpeg_location)

    if settings.cookies_from_browser and settings.cookies_from_browser != "none":
        ydl_opts["cookiesfrombrowser"] = (settings.cookies_from_browser,)

    if settings.cookie_file:
        ydl_opts["cookiefile"] = str(settings.cookie_file)

    if settings.js_runtime == "disabled":
        ydl_opts["js_runtimes"] = {}
    else:
        node_path = shutil.which("node")
        if settings.js_runtime == "node" and node_path:
            ydl_opts["js_runtimes"] = {"node": {"path": node_path}}
        elif settings.js_runtime == "auto" and node_path:
            ydl_opts["js_runtimes"] = {"node": {"path": node_path}}

    class UILogger:
        def debug(self, msg: str) -> None:
            if msg and not msg.startswith("[debug]"):
                log(msg)

        info = debug
        warning = debug
        error = debug

    total = len(normalized_urls)
    downloaded = 0
    failed = 0

    with YoutubeDL({**ydl_opts, "logger": UILogger()}) as ydl:
        for index, url in enumerate(normalized_urls, start=1):
            if should_cancel and should_cancel():
                raise DownloadCancelled(_text(translate, "download_cancelled"))

            log(_text(translate, "download_start", index=index, total=total, url=url))
            item_finished = False

            def hook(data: dict) -> None:
                nonlocal item_finished
                if should_cancel and should_cancel():
                    raise DownloadCancelled(_text(translate, "download_cancelled"))

                status = data.get("status", "")
                if status == "downloading":
                    downloaded_bytes = data.get("downloaded_bytes") or 0
                    total_bytes = data.get("total_bytes") or data.get("total_bytes_estimate") or 0
                    percent = (downloaded_bytes / total_bytes * 100) if total_bytes else 0.0
                    progress(
                        {
                            "item_index": index,
                            "item_total": total,
                            "percent": percent,
                            "status": "downloading",
                            "filename": data.get("filename") or "",
                            "speed": data.get("speed"),
                            "eta": data.get("eta"),
                        }
                    )
                elif status == "finished":
                    item_finished = True
                    progress(
                        {
                            "item_index": index,
                            "item_total": total,
                            "percent": 100.0,
                            "status": "finished",
                            "filename": data.get("filename") or "",
                            "speed": data.get("speed"),
                            "eta": 0,
                        }
                    )
                    log(
                        _text(
                            translate,
                            "download_finished",
                            index=index,
                            total=total,
                            name=Path(data.get("filename") or url).name,
                        )
                    )

            ydl.params["progress_hooks"] = [hook]
            result = ydl.download([url])
            if result == 0 and item_finished:
                downloaded += 1
            else:
                failed += 1

    return downloaded, failed
