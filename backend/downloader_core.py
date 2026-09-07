from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Callable, Iterable
from urllib.request import Request, urlopen
from urllib.parse import urlsplit, urlunsplit

try:
    from yt_dlp.networking.impersonate import ImpersonateTarget
except ImportError:
    ImpersonateTarget = None


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
    js_runtime_path: Path | None = None
    archive_file: Path | None = None
    ffmpeg_location: Path | None = None
    retries: int = 10
    concurrent_fragments: int = 4
    format_selector: str | None = None
    merge_output_format: str = "mp4"
    referrer: str | None = None
    thumbnail_url: str | None = None
    asset_type: str = "video"
    asset_role: str = ""
    subtitle_language: str | None = None
    subtitle_automatic: bool = False
    title: str = "Untitled"
    media_id: str = ""


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


def normalize_format_selector(value: object) -> str | None:
    selector = str(value or "").strip()
    if not selector:
        return None
    if len(selector) > 300 or not re.fullmatch(r"[A-Za-z0-9_+*/.\[\]=:,<>!-]+", selector):
        raise ValueError("Invalid yt-dlp format selector.")
    return selector


def normalize_merge_output_format(value: object) -> str:
    output_format = str(value or "mp4").strip().lower()
    if output_format not in {"mp4", "webm", "mkv"}:
        raise ValueError("Merge output format must be mp4, webm, or mkv.")
    return output_format


def normalize_referrer(value: object) -> str | None:
    referrer = str(value or "").strip()
    if not referrer:
        return None
    if len(referrer) > 2048 or "\r" in referrer or "\n" in referrer:
        raise ValueError("Invalid HTTP referrer.")
    parsed = urlsplit(referrer)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError("Invalid HTTP referrer.")
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, parsed.query, ""))


def normalize_thumbnail_url(value: object) -> str | None:
    thumbnail_url = str(value or "").strip()
    if not thumbnail_url:
        return None
    if len(thumbnail_url) > 4096 or "\r" in thumbnail_url or "\n" in thumbnail_url:
        raise ValueError("Invalid thumbnail URL.")
    parsed = urlsplit(thumbnail_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError("Invalid thumbnail URL.")
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, parsed.query, ""))


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mkv", ".mov", ".m4v", ".avi"}
MAX_THUMBNAIL_BYTES = 20 * 1024 * 1024
ASSET_DIRECTORY_NAMES = {"video", "audio", "images", "subtitles"}


def _content_task_directory(file_path: Path) -> Path:
    parent = file_path.resolve().parent
    return parent.parent if parent.name.lower() in ASSET_DIRECTORY_NAMES else parent


def _thumbnail_extension(url: str, content_type: str | None) -> str:
    mime = str(content_type or "").split(";", 1)[0].strip().lower()
    by_mime = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
    }
    if mime in by_mime:
        return by_mime[mime]
    extension = Path(urlsplit(url).path).suffix.lower()
    return extension if extension in IMAGE_EXTENSIONS else ".jpg"


def _download_fallback_thumbnail(
    task_dir: Path,
    thumbnail_url: str | None,
    referrer: str | None,
    file_stem: str = "cover",
) -> Path | None:
    if not thumbnail_url:
        return None
    headers = {"User-Agent": "Mozilla/5.0 VidoGo/1.0"}
    if referrer:
        headers["Referer"] = referrer
    request = Request(thumbnail_url, headers=headers)
    temporary_path = task_dir / ".cover.download"
    try:
        with urlopen(request, timeout=30) as response:
            declared_length = int(response.headers.get("Content-Length") or 0)
            if declared_length > MAX_THUMBNAIL_BYTES:
                return None
            content = response.read(MAX_THUMBNAIL_BYTES + 1)
            if not content or len(content) > MAX_THUMBNAIL_BYTES:
                return None
            extension = _thumbnail_extension(thumbnail_url, response.headers.get("Content-Type"))
        temporary_path.write_bytes(content)
        cover_path = task_dir / f"{_safe_output_segment(file_stem, 'cover', 48)}{extension}"
        temporary_path.replace(cover_path)
        return cover_path
    except Exception:
        temporary_path.unlink(missing_ok=True)
        return None


def _asset_task_directory(settings: DownloadSettings) -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")[:-3]
    title = _safe_output_segment(settings.title, "Untitled", 120)
    media_id = _safe_output_segment(settings.media_id, "", 72)
    stem = f"{stamp} - {title}{f' [{media_id}]' if media_id else ''}"
    for index in range(1000):
        suffix = f" ({index + 1})" if index else ""
        candidate = settings.output_dir / f"{stem}{suffix}"
        try:
            candidate.mkdir(parents=True, exist_ok=False)
            return candidate
        except FileExistsError:
            continue
    raise RuntimeError("Could not reserve an asset download folder.")


def _safe_output_segment(value: object, fallback: str, max_length: int) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]+', " ", str(value or ""))
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" .")[:max_length]
    return cleaned or fallback


def _download_image_asset(settings: DownloadSettings, progress: ProgressCallback) -> tuple[int, int]:
    task_dir = _asset_task_directory(settings)
    image_dir = task_dir / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    file_stem = "image" if settings.asset_role == "gallery" else "cover"
    cover_path = _download_fallback_thumbnail(image_dir, settings.thumbnail_url, settings.referrer, file_stem)
    if not cover_path:
        shutil.rmtree(task_dir, ignore_errors=True)
        raise RuntimeError("No downloadable cover image was found for this media.")
    file_size = cover_path.stat().st_size
    progress({
        "item_index": 1,
        "item_total": 1,
        "percent": 100.0,
        "status": "completed",
        "filename": str(cover_path.resolve()),
        "task_dir": str(task_dir.resolve()),
        "thumbnail_filename": str(cover_path.resolve()),
        "downloaded_bytes": file_size,
        "total_bytes": file_size,
        "speed": 0,
        "eta": 0,
    })
    return 1, 0


def _generate_video_cover(final_path: Path, ffmpeg_location: Path | None) -> Path | None:
    if final_path.suffix.lower() not in VIDEO_EXTENSIONS or not final_path.is_file():
        return None
    ffmpeg_name = "ffmpeg.exe" if sys.platform.startswith("win") else "ffmpeg"
    ffmpeg_path = (ffmpeg_location / ffmpeg_name) if ffmpeg_location else Path(shutil.which("ffmpeg") or "")
    if not ffmpeg_path.is_file():
        return None
    cover_path = final_path.parent / "cover.jpg"
    command = [
        str(ffmpeg_path), "-hide_banner", "-loglevel", "error", "-y",
        "-ss", "0", "-i", str(final_path), "-frames:v", "1",
        "-vf", "scale=1280:-2:force_original_aspect_ratio=decrease", "-q:v", "2", str(cover_path),
    ]
    try:
        subprocess.run(
            command,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
            timeout=60,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return cover_path if cover_path.is_file() and cover_path.stat().st_size > 0 else None
    except Exception:
        cover_path.unlink(missing_ok=True)
        return None


def finalize_task_output(
    final_filename: str,
    thumbnail_url: str | None,
    referrer: str | None,
    ffmpeg_location: Path | None = None,
) -> tuple[Path, Path | None]:
    final_path = Path(final_filename).resolve()
    task_dir = _content_task_directory(final_path)
    task_dir.mkdir(parents=True, exist_ok=True)
    image_dir = task_dir / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    existing_cover = next((path for path in image_dir.glob("cover.*") if path.suffix.lower() in IMAGE_EXTENSIONS), None)
    if existing_cover:
        return final_path, existing_cover

    thumbnail_candidates = sorted(
        (
            path for directory in {task_dir, final_path.parent}
            for path in directory.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ),
        key=lambda path: (path.stem != final_path.stem, -path.stat().st_mtime_ns),
    )
    if thumbnail_candidates:
        source = thumbnail_candidates[0]
        cover_path = image_dir / f"cover{source.suffix.lower()}"
        source.replace(cover_path)
        return final_path, cover_path

    downloaded_cover = _download_fallback_thumbnail(image_dir, thumbnail_url, referrer)
    if downloaded_cover:
        return final_path, downloaded_cover
    generated_cover = _generate_video_cover(final_path, ffmpeg_location)
    if not generated_cover:
        return final_path, None
    cover_path = image_dir / generated_cover.name
    generated_cover.replace(cover_path)
    return final_path, cover_path


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
    settings.asset_type = str(settings.asset_type or "video").strip().lower()
    if settings.asset_type not in {"video", "audio", "image", "subtitle"}:
        raise ValueError("Unsupported asset type.")
    if settings.asset_type == "image":
        settings.output_dir.mkdir(parents=True, exist_ok=True)
        return _download_image_asset(settings, progress)

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

    if settings.asset_type == "audio":
        settings.audio_only = True

    if not settings.audio_only and settings.asset_type != "subtitle" and not ffmpeg_available:
        log(_text(translate, "warning_ffmpeg_missing"))

    download_stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")[:-3]
    task_folder = f"{download_stamp} - %(title).120B [%(id)s] [%(format_id)s]"
    asset_directory = "audio" if settings.audio_only else "video"
    media_file = asset_directory + "-%(format_id)s.%(ext)s"
    ydl_opts = {
        "paths": {"home": str(settings.output_dir)},
        "outtmpl": {
            "default": f"{task_folder}/{asset_directory}/{media_file}",
            "chapter": f"{task_folder}/chapters/%(section_number)02d - %(section_title).120B.%(ext)s",
        },
        "format": normalize_format_selector(settings.format_selector)
        or build_format_selector(settings.audio_only, normalize_resolution(settings.resolution)),
        "noplaylist": not settings.playlist,
        "ignoreerrors": True,
        "retries": settings.retries,
        "continuedl": True,
        "concurrent_fragment_downloads": max(1, settings.concurrent_fragments),
        # Progress is already delivered through progress_hooks. Suppress yt-dlp's
        # textual progress lines so the desktop UI does not mistake them for
        # user-facing notifications.
        "noprogress": True,
        "windowsfilenames": False,
        "restrictfilenames": False,
        "merge_output_format": normalize_merge_output_format(settings.merge_output_format),
        "format_sort": ["res"] if settings.resolution == "best" else [f"res:{settings.resolution}"],
        "writethumbnail": True,
    }
    if ImpersonateTarget is not None:
        ydl_opts["impersonate"] = ImpersonateTarget.from_str("chrome")

    # Preserve yt-dlp's existing archive behavior for ordinary downloads. An
    # explicit format remains exempt so another resolution can still be saved.
    if not settings.format_selector:
        ydl_opts["download_archive"] = str(archive_file)

    referrer = normalize_referrer(settings.referrer)
    if referrer:
        ydl_opts["http_headers"] = {"Referer": referrer}

    if settings.audio_only:
        ydl_opts["postprocessors"] = [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }
        ]

    if settings.asset_type == "subtitle":
        language = str(settings.subtitle_language or "").strip()
        if not language:
            raise ValueError("Missing subtitle language.")
        ydl_opts.update({
            "skip_download": True,
            "writesubtitles": not settings.subtitle_automatic,
            "writeautomaticsub": settings.subtitle_automatic,
            "subtitleslangs": [language],
            "subtitlesformat": "srt/vtt/ttml/best",
            "writethumbnail": False,
            "outtmpl": {
                "default": f"{task_folder}/subtitles/subtitle.%(ext)s",
                "subtitle": f"{task_folder}/subtitles/subtitle.%(ext)s",
            },
        })
        # Subtitles are a separate asset from the ordinary video archive.  Do
        # not mutate or replace the existing video archive behavior.
        ydl_opts.pop("download_archive", None)

    if settings.ffmpeg_location:
        ydl_opts["ffmpeg_location"] = str(settings.ffmpeg_location)

    if settings.cookies_from_browser and settings.cookies_from_browser != "none":
        ydl_opts["cookiesfrombrowser"] = (settings.cookies_from_browser,)

    if settings.cookie_file:
        ydl_opts["cookiefile"] = str(settings.cookie_file)

    if settings.js_runtime == "disabled":
        ydl_opts["js_runtimes"] = {}
    elif settings.js_runtime_path:
        ydl_opts["js_runtimes"] = {"node": {"path": str(settings.js_runtime_path)}}
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
    current_index = 0
    current_url = ""
    final_paths: list[str] = []

    def hook(data: dict) -> None:
        if should_cancel and should_cancel():
            raise DownloadCancelled(_text(translate, "download_cancelled"))

        status = data.get("status", "")
        if status == "downloading":
            downloaded_bytes = data.get("downloaded_bytes") or 0
            total_bytes = data.get("total_bytes") or data.get("total_bytes_estimate") or 0
            percent = (downloaded_bytes / total_bytes * 100) if total_bytes else 0.0
            progress(
                {
                    "item_index": current_index,
                    "item_total": total,
                    "percent": percent,
                    "status": "downloading",
                    "filename": data.get("filename") or "",
                    "task_dir": str(_content_task_directory(Path(data["filename"]))) if data.get("filename") else str(settings.output_dir.resolve()),
                    "downloaded_bytes": downloaded_bytes,
                    "total_bytes": total_bytes,
                    "speed": data.get("speed"),
                    "eta": data.get("eta"),
                }
            )
        elif status == "finished":
            progress(
                {
                    "item_index": current_index,
                    "item_total": total,
                    "percent": 100.0,
                    "status": "processing",
                    "filename": data.get("filename") or "",
                    "task_dir": str(_content_task_directory(Path(data["filename"]))) if data.get("filename") else str(settings.output_dir.resolve()),
                    "downloaded_bytes": data.get("total_bytes") or data.get("downloaded_bytes") or 0,
                    "total_bytes": data.get("total_bytes") or data.get("downloaded_bytes") or 0,
                    "speed": data.get("speed"),
                    "eta": 0,
                }
            )

    def post_hook(filename: str) -> None:
        if filename:
            final_paths.append(str(Path(filename).resolve()))

    with YoutubeDL({**ydl_opts, "logger": UILogger()}) as ydl:
        ydl.add_progress_hook(hook)
        ydl.add_post_hook(post_hook)
        for index, url in enumerate(normalized_urls, start=1):
            if should_cancel and should_cancel():
                raise DownloadCancelled(_text(translate, "download_cancelled"))

            log(_text(translate, "download_start", index=index, total=total, url=url))
            current_index = index
            current_url = url
            first_new_final_path = len(final_paths)
            files_before = set(settings.output_dir.rglob("*")) if settings.asset_type == "subtitle" else set()
            result = ydl.download([url])
            if result == 0:
                if settings.asset_type == "subtitle":
                    subtitle_extensions = {".srt", ".vtt", ".ttml", ".srv1", ".srv2", ".srv3", ".json3"}
                    created = [
                        str(path.resolve()) for path in settings.output_dir.rglob("*")
                        if path.is_file() and path not in files_before and path.suffix.lower() in subtitle_extensions
                    ]
                    final_paths.extend(created)
                new_paths = final_paths[first_new_final_path:]
                if not new_paths:
                    raise RuntimeError(
                        f"The requested subtitle ({settings.subtitle_language}) was not returned by the media platform."
                        if settings.asset_type == "subtitle"
                        else "The downloader finished without producing a media file."
                    )
                downloaded += 1
                for final_filename in new_paths:
                    if settings.asset_type == "subtitle":
                        final_path, cover_path = Path(final_filename).resolve(), None
                    else:
                        final_path, cover_path = finalize_task_output(
                            final_filename,
                            normalize_thumbnail_url(settings.thumbnail_url),
                            referrer,
                            settings.ffmpeg_location,
                        )
                    file_size = final_path.stat().st_size if final_path.exists() else 0
                    progress(
                        {
                            "item_index": current_index,
                            "item_total": total,
                            "percent": 100.0,
                            "status": "completed",
                            "filename": str(final_path),
                            "task_dir": str(_content_task_directory(final_path)),
                            "thumbnail_filename": str(cover_path) if cover_path else "",
                            "downloaded_bytes": file_size,
                            "total_bytes": file_size,
                            "speed": 0,
                            "eta": 0,
                        }
                    )
                    log(
                        _text(
                            translate,
                            "download_finished",
                            index=current_index,
                            total=total,
                            name=final_path.name,
                        )
                    )
            else:
                failed += 1

    return downloaded, failed
