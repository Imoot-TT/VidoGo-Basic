from __future__ import annotations

from hashlib import sha1
from pathlib import Path
import re
from typing import Any
from urllib.parse import urlparse


VIDEO_CODEC_RANKS = {"AV1": 4, "VP9": 3, "H.265": 2, "H.264": 1}


def _positive_number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool) and value > 0:
        return float(value)
    return None


def _positive_integer(value: Any) -> int | None:
    number = _positive_number(value)
    return round(number) if number is not None else None


def _codec_state(value: Any) -> str:
    codec = str(value or "").strip().lower()
    if not codec or codec == "unknown":
        return "unknown"
    return "none" if codec == "none" else "present"


def _video_codec_label(value: Any) -> str | None:
    codec = str(value or "").strip()
    normalized = codec.lower()
    if not normalized or normalized in {"none", "unknown"}:
        return None
    if normalized.startswith(("av01", "av1")):
        return "AV1"
    if normalized.startswith(("vp09", "vp9")):
        return "VP9"
    if normalized.startswith(("avc1", "avc3", "h264")):
        return "H.264"
    if normalized.startswith(("hev1", "hvc1", "hevc", "h265")):
        return "H.265"
    return codec.split(".", 1)[0].upper() or "VIDEO"


def _audio_codec_label(value: Any) -> str | None:
    codec = str(value or "").strip()
    normalized = codec.lower()
    if not normalized or normalized in {"none", "unknown"}:
        return None
    if normalized.startswith(("mp4a", "aac")):
        return "AAC"
    if "opus" in normalized:
        return "Opus"
    if "vorbis" in normalized:
        return "Vorbis"
    return codec.split(".", 1)[0].upper() or None


def _format_extension(format_info: dict[str, Any]) -> str | None:
    value = format_info.get("ext") or format_info.get("video_ext") or format_info.get("audio_ext")
    extension = str(value or "").strip().lower()
    return extension or None


def _output_extension(format_info: dict[str, Any]) -> str | None:
    extension = _format_extension(format_info)
    if extension in {"mp4", "m4v", "mov"}:
        return "mp4"
    return "webm" if extension == "webm" else None


def _resolution(format_info: dict[str, Any]) -> int | None:
    width = _positive_integer(format_info.get("width"))
    height = _positive_integer(format_info.get("height"))
    return min(width, height) if width and height else None


def _is_hdr(format_info: dict[str, Any]) -> bool:
    dynamic_range = str(format_info.get("dynamic_range") or "").strip().upper()
    return bool(dynamic_range and dynamic_range not in {"SDR", "SDR10"})


def _format_size(format_info: dict[str, Any], duration_seconds: float | None, *, audio: bool) -> int | None:
    known_size = _positive_number(format_info.get("filesize") or format_info.get("filesize_approx"))
    if known_size is not None:
        return round(known_size)
    bitrate = _positive_number(format_info.get("abr") if audio else format_info.get("tbr"))
    if bitrate is None and audio:
        bitrate = _positive_number(format_info.get("tbr"))
    if duration_seconds and bitrate:
        return round(duration_seconds * bitrate * 1000 / 8)
    return None


def _is_audio_only(format_info: dict[str, Any]) -> bool:
    if not format_info.get("format_id"):
        return False
    if _codec_state(format_info.get("vcodec")) == "none" and _codec_state(format_info.get("acodec")) == "present":
        return True
    # Some extractors, notably X/Twitter HLS, identify audio-only formats via
    # the normalized extension/resolution fields but omit acodec entirely.
    video_extension = str(format_info.get("video_ext") or "").strip().lower()
    audio_extension = str(format_info.get("audio_ext") or "").strip().lower()
    resolution = str(format_info.get("resolution") or "").strip().lower()
    return (video_extension == "none" and audio_extension not in {"", "none"}) or resolution == "audio only"


def _audio_is_compatible(format_info: dict[str, Any], extension: str) -> bool:
    audio_extension = _format_extension(format_info)
    codec = str(format_info.get("acodec") or "").lower()
    if extension == "mp4":
        return audio_extension in {"m4a", "mp4", "aac"} or codec.startswith(("mp4a", "aac"))
    return audio_extension == "webm" or "opus" in codec or "vorbis" in codec


def _select_audio(formats: list[dict[str, Any]], extension: str) -> dict[str, Any] | None:
    compatible = [item for item in formats if _audio_is_compatible(item, extension)]
    return max(
        compatible,
        key=lambda item: (
            int(item.get("audio_is_default") is True),
            _positive_number(item.get("language_preference")) or 0,
            _positive_number(item.get("abr") or item.get("tbr")) or 0,
        ),
        default=None,
    )


def _merged_format_selector(video_id: str, audio: dict[str, Any], extension: str, width: int, height: int) -> str:
    audio_id = str(audio["format_id"])
    audio_extension = _format_extension(audio)
    audio_filter = f"[ext={audio_extension}]" if audio_extension else ""
    return f"{video_id}+{audio_id}/bv*[ext={extension}][width={width}][height={height}]+ba{audio_filter}"


def plan_video_formats(formats: list[dict[str, Any]], duration_seconds: float | None) -> list[dict[str, Any]]:
    audio_formats = [item for item in formats if _is_audio_only(item)]
    selected: dict[tuple[int, str], tuple[tuple[float, ...], dict[str, Any]]] = {}
    for index, item in enumerate(formats):
        format_id = str(item.get("format_id") or "")
        if not format_id or item.get("protocol") == "mhtml" or format_id.startswith("sb"):
            continue
        if _codec_state(item.get("vcodec")) != "present":
            continue
        resolution = _resolution(item)
        codec = _video_codec_label(item.get("vcodec"))
        if not resolution or not codec:
            continue
        rank = (
            float(int(_is_hdr(item))),
            -(_positive_number(item.get("fps")) or 0),
            -(_positive_number(item.get("tbr")) or 0),
            -float(index),
        )
        key = (resolution, codec)
        if key not in selected or rank < selected[key][0]:
            selected[key] = (rank, item)

    plans: list[dict[str, Any]] = []
    for (resolution, codec), (_rank, video) in selected.items():
        video_id = str(video["format_id"])
        width = _positive_integer(video.get("width"))
        height = _positive_integer(video.get("height"))
        extension = _output_extension(video)
        if not width or not height or not extension:
            continue
        has_audio = _codec_state(video.get("acodec")) == "present"
        audio = None if has_audio else _select_audio(audio_formats, extension)
        if not has_audio and not audio and audio_formats:
            continue
        video_size = _format_size(video, duration_seconds, audio=False)
        audio_size = _format_size(audio, duration_seconds, audio=True) if audio else 0
        total_size = video_size + audio_size if video_size is not None and audio_size is not None else None
        selector = video_id if not audio else _merged_format_selector(video_id, audio, extension, width, height)
        plans.append(
            {
                "formatSelector": selector,
                "extension": extension,
                "width": width,
                "height": height,
                "resolution": resolution,
                "videoCodec": codec,
                "audioCodec": _audio_codec_label(audio.get("acodec") if audio else video.get("acodec")),
                "hasAudio": has_audio or audio is not None,
                "fps": _positive_integer(video.get("fps")),
                "totalSizeBytes": total_size,
            }
        )

    return sorted(
        plans,
        key=lambda item: (
            -item["resolution"],
            -VIDEO_CODEC_RANKS.get(item["videoCodec"], 0),
            -(item.get("totalSizeBytes") or 0),
        ),
    )


def _thumbnail_url(info: dict[str, Any]) -> str | None:
    if info.get("thumbnail"):
        return str(info["thumbnail"])
    thumbnails = info.get("thumbnails")
    if isinstance(thumbnails, list):
        for item in reversed(thumbnails):
            if isinstance(item, dict) and item.get("url"):
                return str(item["url"])
    return None


def _safe_file_name(title: str) -> str:
    value = "".join("_" if char in '<>:"/\\|?*' else char for char in title).strip(" .")
    return value[:180] or "video"


def _provider_name(info: dict[str, Any], page_url: str, provider_hint: str | None) -> str:
    raw_value = provider_hint or info.get("extractor_key") or info.get("extractor")
    if not raw_value:
        hostname = (urlparse(page_url).hostname or "").lower().removeprefix("www.")
        raw_value = hostname.split(".")[-2] if "." in hostname else hostname
    provider = re.sub(r"[^a-z0-9_-]+", "-", str(raw_value).strip().lower()).strip("-")
    aliases = {"x": "twitter", "youtu-be": "youtube", "youtube-tab": "youtube"}
    return aliases.get(provider, provider)[:40] or "web"


def _is_live_media(info: dict[str, Any]) -> bool:
    live_status = str(info.get("live_status") or "").strip().lower()
    return info.get("is_live") is True or live_status in {"is_live", "is_upcoming"}


def create_media_candidates(
    info: dict[str, Any],
    page_url: str,
    web_contents_id: int,
    provider_hint: str | None = None,
) -> list[dict[str, Any]]:
    entries = info.get("entries")
    items = [item for item in entries if isinstance(item, dict)] if isinstance(entries, list) else [info]
    candidates: list[dict[str, Any]] = []
    for item in items:
        item_url = str(item.get("webpage_url") or page_url)
        title = str(item.get("title") or item.get("fulltitle") or "Video")
        video_id = str(item.get("id") or item_url)
        provider = _provider_name(item, item_url, provider_hint)
        if _is_live_media(item):
            candidate_id = sha1(f"{provider}:{video_id}".encode("utf-8")).hexdigest()[:20]
            candidates.append(
                {
                    "id": f"media-{web_contents_id}-{candidate_id}",
                    "webContentsId": web_contents_id,
                    "url": item_url,
                    "pageUrl": item_url,
                    "provider": provider,
                    "fileName": _safe_file_name(title),
                    "title": title,
                    "kind": "video",
                    "thumbnailUrl": _thumbnail_url(item),
                    "variants": [],
                    "hasAudio": True,
                    "hasVideo": True,
                    "isLive": True,
                    "isRecommended": True,
                    "downloadStrategy": "record",
                    "sourceClient": "yt-dlp",
                    "metadataSource": f"yt-dlp:{provider}",
                }
            )
            continue
        raw_formats = item.get("formats")
        formats = [value for value in raw_formats if isinstance(value, dict)] if isinstance(raw_formats, list) else []
        duration = _positive_number(item.get("duration"))
        plans = plan_video_formats(formats, duration)
        if not plans:
            direct_url = str(item.get("url") or "").strip()
            extension = _output_extension(item)
            if not direct_url or not extension:
                continue
            candidate_id = sha1(f"{provider}:{video_id}".encode("utf-8")).hexdigest()[:20]
            width = _positive_integer(item.get("width"))
            height = _positive_integer(item.get("height"))
            resolution = min(width, height) if width and height else None
            video_codec = _video_codec_label(item.get("vcodec"))
            audio_state = _codec_state(item.get("acodec"))
            audio_extension = str(item.get("audio_ext") or "").strip().lower()
            candidates.append(
                {
                    "id": f"media-{web_contents_id}-{candidate_id}",
                    "webContentsId": web_contents_id,
                    "url": item_url,
                    "pageUrl": item_url,
                    "provider": provider,
                    "fileName": _safe_file_name(title),
                    "title": title,
                    "kind": "video",
                    "thumbnailUrl": _thumbnail_url(item),
                    "formatId": str(item.get("format_id") or "").strip() or None,
                    "mimeType": f"video/{extension}",
                    "extension": extension,
                    "sizeBytes": _format_size(item, duration, audio=False),
                    "width": width,
                    "height": height,
                    "resolution": resolution,
                    "variants": [],
                    "qualityLabel": f"{resolution}p" if resolution else None,
                    "videoCodec": video_codec,
                    "audioCodec": _audio_codec_label(item.get("acodec")),
                    "fps": _positive_integer(item.get("fps")),
                    "hasAudio": audio_state == "present" or (audio_state == "unknown" and audio_extension != "none"),
                    "hasVideo": True,
                    "isRecommended": True,
                    "downloadStrategy": "merge",
                    "sourceClient": "yt-dlp",
                    "metadataSource": f"yt-dlp:{provider}",
                }
            )
            continue
        variants = [
            {
                "url": item_url,
                "formatId": plan["formatSelector"],
                "mimeType": f"video/{plan['extension']}",
                "extension": plan["extension"],
                "qualityLabel": f"{plan['resolution']}p · {plan['videoCodec']}",
                "width": plan["width"],
                "height": plan["height"],
                "resolution": plan["resolution"],
                "videoCodec": plan["videoCodec"],
                "audioCodec": plan["audioCodec"],
                "fps": plan["fps"],
                "hasAudio": plan["hasAudio"],
                "hasVideo": True,
                "sourceClient": "yt-dlp",
                "sizeBytes": plan["totalSizeBytes"],
                "isDrmProtected": False,
            }
            for plan in plans[:20]
        ]
        primary = variants[0]
        candidate_id = sha1(f"{provider}:{video_id}".encode("utf-8")).hexdigest()[:20]
        candidates.append(
            {
                "id": f"media-{web_contents_id}-{candidate_id}",
                "webContentsId": web_contents_id,
                "url": item_url,
                "pageUrl": item_url,
                "provider": provider,
                "fileName": _safe_file_name(title),
                "title": title,
                "kind": "video",
                "thumbnailUrl": _thumbnail_url(item),
                "formatId": primary["formatId"],
                "mimeType": primary["mimeType"],
                "extension": primary["extension"],
                "sizeBytes": primary["sizeBytes"],
                "width": primary["width"],
                "height": primary["height"],
                "resolution": primary["resolution"],
                "variants": variants,
                "qualityLabel": primary["qualityLabel"],
                "videoCodec": primary["videoCodec"],
                "audioCodec": primary["audioCodec"],
                "fps": primary["fps"],
                "hasAudio": primary["hasAudio"],
                "hasVideo": True,
                "isRecommended": True,
                "downloadStrategy": "merge",
                "sourceClient": "yt-dlp",
                "metadataSource": f"yt-dlp:{provider}",
            }
        )
    return candidates
