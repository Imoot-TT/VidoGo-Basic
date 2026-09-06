from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import types
from unittest.mock import patch
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from downloader_core import (  # noqa: E402
    DownloadSettings,
    build_format_selector,
    download_urls,
    finalize_task_output,
    human_eta,
    human_size,
    load_urls_from_text,
    normalize_resolution,
    normalize_format_selector,
    normalize_merge_output_format,
    normalize_referrer,
)
from metadata_core import create_media_candidates  # noqa: E402


def assert_equal(actual: object, expected: object, message: str) -> None:
    if actual != expected:
        raise AssertionError(f"{message}: expected {expected!r}, got {actual!r}")


def assert_raises(error_type: type[BaseException], callback, message: str) -> None:
    try:
        callback()
    except error_type:
        return
    raise AssertionError(f"{message}: expected {error_type.__name__}")


def verify_core_helpers() -> None:
    assert_equal(
        load_urls_from_text("\n# comment\nhttps://a.example/video\nhttps://a.example/video\n https://b.example \n"),
        ["https://a.example/video", "https://b.example"],
        "URL parser should trim, ignore comments, and deduplicate",
    )
    assert_equal(normalize_resolution("best"), "best", "best resolution should pass")
    assert_equal(normalize_resolution("1080"), "1080", "numeric resolution should pass")
    assert_raises(ValueError, lambda: normalize_resolution("4k"), "invalid resolution should fail")
    assert_equal(
        build_format_selector(False, "best"),
        "bestvideo*+bestaudio/bestvideo+bestaudio/best",
        "best video format selector",
    )
    assert_equal(
        build_format_selector(False, "720"),
        "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
        "bounded video format selector",
    )
    assert_equal(build_format_selector(True, "1080"), "bestaudio/best", "audio-only format selector")
    assert_equal(human_size(1024), "1.0 KB/s", "speed formatting")
    assert_equal(human_eta(65), "01:05", "ETA formatting")
    assert_equal(normalize_format_selector("248+251/bv*[ext=webm]+ba[ext=webm]"), "248+251/bv*[ext=webm]+ba[ext=webm]", "format selector validation")
    assert_raises(ValueError, lambda: normalize_format_selector("best;rm -rf"), "unsafe format selector should fail")
    assert_equal(normalize_merge_output_format("webm"), "webm", "WebM variants should preserve their merge container")
    assert_raises(ValueError, lambda: normalize_merge_output_format("exe"), "invalid merge output format should fail")
    assert_equal(normalize_referrer("https://example.com/watch?v=1#chapter"), "https://example.com/watch?v=1", "download referrer normalization")
    assert_raises(ValueError, lambda: normalize_referrer("file:///C:/secret"), "non-HTTP referrers should fail")
    settings = DownloadSettings(output_dir=ROOT, format_selector="137+140")
    assert_equal(settings.format_selector, "137+140", "download settings should retain an explicit format selector")


def verify_metadata_planning() -> None:
    info = {
        "id": "sample123",
        "title": "Sample video",
        "webpage_url": "https://www.youtube.com/watch?v=sample123",
        "thumbnail": "https://i.ytimg.com/vi/sample123/maxresdefault.jpg",
        "duration": 120,
        "formats": [
            {"format_id": "137", "ext": "mp4", "width": 1920, "height": 1080, "fps": 30, "tbr": 4500, "vcodec": "avc1.640028", "acodec": "none"},
            {"format_id": "248", "ext": "webm", "width": 1920, "height": 1080, "fps": 30, "tbr": 3800, "vcodec": "vp9", "acodec": "none"},
            {"format_id": "22", "ext": "mp4", "width": 1280, "height": 720, "fps": 30, "filesize": 20_000_000, "vcodec": "avc1.64001F", "acodec": "mp4a.40.2"},
            {"format_id": "140", "ext": "m4a", "abr": 128, "vcodec": "none", "acodec": "mp4a.40.2"},
            {"format_id": "251", "ext": "webm", "abr": 160, "vcodec": "none", "acodec": "opus"},
        ],
    }
    candidates = create_media_candidates(info, info["webpage_url"], 42)
    assert_equal(len(candidates), 1, "metadata should create one logical video candidate")
    candidate = candidates[0]
    assert_equal(candidate["isRecommended"], True, "metadata candidate should be recommended")
    assert_equal(candidate["provider"], "youtube", "metadata provider should be derived from the page URL")
    assert_equal(candidate["mediaId"], info["id"], "metadata candidate should preserve the provider media id")
    assert_equal(candidate["metadataSource"], "yt-dlp:youtube", "metadata source should identify the provider")
    assert_equal(candidate["thumbnailUrl"], info["thumbnail"], "metadata thumbnail")
    assert_equal(len(candidate["variants"]), 3, "metadata should retain codec and resolution variants")
    assert_equal(candidate["variants"][0]["qualityLabel"], "1080p · VP9", "variants should sort by resolution and codec")
    assert_equal(candidate["variants"][0]["formatId"].startswith("248+251/"), True, "webm video should pair with compatible audio")
    vimeo_candidate = create_media_candidates(info, "https://vimeo.com/sample123", 42, "vimeo")[0]
    assert_equal(vimeo_candidate["provider"], "vimeo", "provider hints should support non-YouTube extractors")
    assert_equal(vimeo_candidate["id"] != candidate["id"], True, "candidate IDs should be namespaced by provider")

    twitter_info = {
        "id": "2041472949631483904",
        "title": "Sample X video",
        "webpage_url": "https://x.com/example/status/2041474345386783199",
        "duration": 30,
        "formats": [
            {
                "format_id": "hls-1418", "ext": "mp4", "video_ext": "mp4", "audio_ext": "none",
                "width": 720, "height": 1280, "tbr": 1418, "vcodec": "avc1.64001F", "acodec": "none",
            },
            {
                "format_id": "hls-audio-128000-Audio", "ext": "mp4", "video_ext": "none", "audio_ext": "mp4",
                "resolution": "audio only", "abr": 128, "vcodec": "none",
            },
        ],
    }
    twitter_candidate = create_media_candidates(twitter_info, twitter_info["webpage_url"], 42, "twitter")[0]
    assert_equal(len(twitter_candidate["variants"]), 1, "X HLS metadata should create a downloadable variant")
    assert_equal(
        twitter_candidate["variants"][0]["formatId"].startswith("hls-1418+hls-audio-128000-Audio/"),
        True,
        "X HLS video should pair with its codec-less audio stream",
    )

    silent_info = {
        "id": "silent-reel",
        "title": "Silent reel",
        "webpage_url": "https://www.instagram.com/reel/silent-reel/",
        "formats": [
            {
                "format_id": "dash-video", "ext": "mp4", "width": 720, "height": 1280,
                "vcodec": "avc1.64001F", "acodec": "none", "video_ext": "mp4", "audio_ext": "none",
            },
        ],
    }
    silent_candidate = create_media_candidates(silent_info, silent_info["webpage_url"], 42, "instagram")[0]
    assert_equal(silent_candidate["hasAudio"], False, "silent videos should remain downloadable")

    direct_info = {
        "id": "spotlight123",
        "title": "Spotlight",
        "webpage_url": "https://www.snapchat.com/spotlight/spotlight123",
        "url": "https://cdn.example/spotlight.mp4",
        "format_id": "0",
        "ext": "mp4",
        "video_ext": "mp4",
        "audio_ext": "none",
        "formats": [],
    }
    direct_candidate = create_media_candidates(direct_info, direct_info["webpage_url"], 42, "snapchat")[0]
    assert_equal(direct_candidate["formatId"], "0", "direct extractor output should retain its format selector")

    live_info = {
        "id": "live123",
        "title": "Sample live stream",
        "webpage_url": "https://www.youtube.com/watch?v=live123",
        "thumbnail": "https://i.ytimg.com/vi/live123/hqdefault.jpg",
        "is_live": True,
        "live_status": "is_live",
        "formats": info["formats"],
    }
    live_candidate = create_media_candidates(live_info, live_info["webpage_url"], 42)[0]
    assert_equal(live_candidate["isLive"], True, "live metadata must be marked as live")
    assert_equal(live_candidate["downloadStrategy"], "record", "live metadata must require recording instead of direct download")
    assert_equal(live_candidate["variants"], [], "live metadata must not expose direct-download variants")


def verify_runtime_progress_hook() -> None:
    events: list[dict] = []
    logs: list[str] = []
    captured_options: list[dict] = []

    class FakeYoutubeDL:
        def __init__(self, _options: dict) -> None:
            self.hooks = []
            self.post_hooks = []
            self.options = _options
            captured_options.append(_options)

        def __enter__(self):
            return self

        def __exit__(self, *_args) -> None:
            pass

        def add_progress_hook(self, hook) -> None:
            self.hooks.append(hook)

        def add_post_hook(self, hook) -> None:
            self.post_hooks.append(hook)

        def download(self, _urls: list[str]) -> int:
            if "http_headers" in self.options:
                assert_equal(self.options["http_headers"].get("Referer"), "https://example.com/watch?v=1", "download referrer header")
            if not self.hooks:
                raise AssertionError("runtime progress hook was not registered")
            task_dir = Path(self.options["paths"]["home"]) / "sample [137+140]"
            task_dir.mkdir(parents=True, exist_ok=True)
            final_path = task_dir / "video.mp4"
            final_path.write_bytes(b"video")
            (task_dir / "video.webp").write_bytes(b"cover")
            self.hooks[0]({"status": "downloading", "filename": str(task_dir / "video.f140.m4a"), "downloaded_bytes": 50, "total_bytes": 100})
            self.hooks[0]({"status": "finished", "filename": str(task_dir / "video.f140.m4a"), "downloaded_bytes": 100, "total_bytes": 100})
            for post_hook in self.post_hooks:
                post_hook(str(final_path))
            return 0

    with tempfile.TemporaryDirectory() as output_dir:
        fake_module = types.SimpleNamespace(YoutubeDL=FakeYoutubeDL)
        with patch.dict(sys.modules, {"yt_dlp": fake_module}):
            downloaded, failed = download_urls(
                ["https://example.com/sample.mp4"],
                DownloadSettings(output_dir=Path(output_dir), audio_only=True, referrer="https://example.com/watch?v=1"),
                logs.append,
                events.append,
            )
            assert_equal(Path(events[-1]["filename"]).exists(), True, "completed event final media path")
            assert_equal(Path(events[-1]["task_dir"]).is_dir(), True, "completed event task directory")
            assert_equal(Path(events[-1]["thumbnail_filename"]).name, "cover.webp", "completed event downloaded cover")
            assert_equal(Path(events[-1]["thumbnail_filename"]).exists(), True, "downloaded cover exists")
    assert_equal((downloaded, failed), (1, 0), "successful runtime hook download accounting")
    assert_equal([event["status"] for event in events], ["downloading", "processing", "completed"], "runtime hook progress states")
    assert_equal(events[-1]["percent"], 100.0, "runtime hook completion percent")
    assert_equal(captured_options[0].get("noprogress"), True, "yt-dlp textual progress must be suppressed")
    assert_equal(captured_options[0].get("writethumbnail"), True, "source thumbnail must be downloaded")
    assert_equal(captured_options[0].get("impersonate").client, "chrome", "downloads should use browser impersonation for protected media pages")
    if "/audio-%(format_id)s.%(ext)s" not in captured_options[0]["outtmpl"]["default"].replace("\\", "/"):
        raise AssertionError("audio downloads must use a descriptive format-specific file name")
    assert_equal("download_archive" in captured_options[0], True, "ordinary downloads should retain archive protection")
    if not captured_options[0]["outtmpl"]["default"][:19].replace("-", "").isdigit():
        raise AssertionError("download task folders must begin with a sortable millisecond timestamp")

    format_events: list[dict] = []
    with tempfile.TemporaryDirectory() as output_dir:
        fake_module = types.SimpleNamespace(YoutubeDL=FakeYoutubeDL)
        with patch.dict(sys.modules, {"yt_dlp": fake_module}):
            download_urls(
                ["https://example.com/sample.mp4"],
                DownloadSettings(output_dir=Path(output_dir), format_selector="137+140"),
                logs.append,
                format_events.append,
            )
    explicit_options = captured_options[-1]
    if "/video-%(format_id)s.%(ext)s" not in explicit_options["outtmpl"]["default"].replace("\\", "/"):
        raise AssertionError("video downloads must use a descriptive format-specific file name")
    assert_equal("download_archive" in explicit_options, False, "format-specific downloads must not suppress later resolutions")
    if "[%(format_id)s]" not in explicit_options["outtmpl"]["default"]:
        raise AssertionError("format-specific downloads need unique output filenames")


def verify_worker_rejects_empty_payload() -> None:
    payload = run_worker("")
    assert_equal(payload["type"], "error", "worker empty payload event type")
    assert "Missing task payload" in payload["message"]


def run_worker(input_text: str) -> dict:
    worker = ROOT / "backend" / "download_worker.py"
    proc = subprocess.run(
        [sys.executable, str(worker)],
        input=input_text,
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode == 0:
        raise AssertionError("worker should reject invalid task payload")
    line = proc.stdout.strip().splitlines()[-1]
    return json.loads(line)


def verify_worker_rejects_invalid_payloads() -> None:
    cases = [
        ("{", "Invalid task payload"),
        ("[]", "Task payload must be an object"),
        (json.dumps({"outputDir": "C:/tmp"}), "No URLs provided"),
        (json.dumps({"urls": ["https://example.com/video.mp4"]}), "Missing output directory"),
        (json.dumps({"urls": ["https://example.com/video.mp4"], "outputDir": "C:/tmp", "formatId": "best;bad"}), "Invalid yt-dlp format selector"),
        (json.dumps({"urls": ["https://example.com/video.mp4"], "outputDir": "C:/tmp", "mergeOutputFormat": "exe"}), "Merge output format must be"),
        (json.dumps({"urls": ["https://example.com/video.mp4"], "outputDir": "C:/tmp", "thumbnailUrl": "file:///tmp/cover.jpg"}), "Invalid thumbnail URL"),
    ]
    for input_text, expected_message in cases:
        payload = run_worker(input_text)
        assert_equal(payload["type"], "error", f"worker error event type for {expected_message}")
        if expected_message not in payload["message"]:
            raise AssertionError(f"worker message should include {expected_message!r}: {payload['message']!r}")


def verify_unified_worker_dispatch() -> None:
    worker = ROOT / "backend" / "worker.py"
    invalid_mode = subprocess.run(
        [sys.executable, str(worker), "unknown"],
        text=True,
        capture_output=True,
        check=False,
    )
    assert_equal(invalid_mode.returncode, 2, "unified worker should reject unknown modes")
    payload = json.loads(invalid_mode.stdout.strip())
    assert "download or metadata" in payload["error"]

    empty_download = subprocess.run(
        [sys.executable, str(worker), "download"],
        input="",
        text=True,
        capture_output=True,
        check=False,
    )
    assert_equal(empty_download.returncode, 1, "unified worker should dispatch downloads")
    payload = json.loads(empty_download.stdout.strip().splitlines()[-1])
    assert "Missing task payload" in payload["message"]


def verify_generated_video_cover() -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return
    with tempfile.TemporaryDirectory() as output_dir:
        video_path = Path(output_dir) / "video.mp4"
        subprocess.run(
            [
                ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                "-f", "lavfi", "-i", "color=c=blue:s=64x36:d=0.2",
                "-pix_fmt", "yuv420p", str(video_path),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        final_path, cover_path = finalize_task_output(video_path, None, None, Path(ffmpeg).parent)
        assert_equal(final_path, video_path.resolve(), "generated-cover final video path")
        assert_equal(cover_path is not None and cover_path.name == "cover.jpg", True, "generated fallback cover path")
        assert_equal(cover_path is not None and cover_path.stat().st_size > 0, True, "generated fallback cover contents")


def main() -> int:
    verify_core_helpers()
    verify_metadata_planning()
    verify_runtime_progress_hook()
    verify_generated_video_cover()
    verify_worker_rejects_empty_payload()
    verify_worker_rejects_invalid_payloads()
    verify_unified_worker_dispatch()
    print("backend verification passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
