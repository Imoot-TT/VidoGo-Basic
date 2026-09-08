"""Check the packaged media binaries and matching update metadata before upload."""
from pathlib import Path
import base64
import hashlib
import json
import os
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FULL_BUILD_FLAGS = (
    "--enable-libjxl",
    "--enable-libplacebo",
    "--enable-opencl",
    "--enable-vulkan",
    "--enable-whisper",
)


def main() -> None:
    version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    dist = ROOT / "dist"
    installer = dist / f"VidoGo-Basic-{version}-x64-Setup.exe"
    for artifact in (installer, Path(str(installer) + ".blockmap"), dist / "latest.yml"):
        if not artifact.is_file() or not artifact.stat().st_size:
            raise RuntimeError(f"Missing or empty release artifact: {artifact}")
    metadata = (dist / "latest.yml").read_text(encoding="utf-8")
    digest = base64.b64encode(hashlib.sha512(installer.read_bytes()).digest()).decode("ascii")
    if installer.name not in metadata or digest not in metadata:
        raise RuntimeError("latest.yml does not match the installer filename and SHA-512")
    vendor = dist / "win-unpacked" / "resources" / "vendor"
    if not (vendor / "vidogo-worker.exe").is_file():
        raise RuntimeError("Packaged Python worker is missing")
    env = dict(os.environ)
    # Do not let the builder's installed media tools rescue an incomplete package.
    env["PATH"] = str(Path(env.get("SystemRoot", r"C:\Windows")) / "System32")
    with tempfile.TemporaryDirectory(prefix="vidogo-release-verify-") as scratch:
        audio = Path(scratch) / "test.mp3"
        ffmpeg_version = ""
        for tool in ("ffmpeg", "ffprobe"):
            executable = vendor / "bin" / f"{tool}.exe"
            if not executable.is_file() or executable.stat().st_size < 1024 * 1024:
                raise RuntimeError(f"Packaged {tool} is missing or is a launcher shim")
            version_result = subprocess.run(
                [str(executable), "-version"], env=env, cwd=scratch,
                capture_output=True, text=True, check=True, timeout=30,
            )
            if tool == "ffmpeg":
                ffmpeg_version = version_result.stdout
            print(f"Packaged {tool}: {executable.stat().st_size} bytes")
        missing_flags = [flag for flag in FULL_BUILD_FLAGS if flag not in ffmpeg_version]
        if missing_flags:
            raise RuntimeError(
                "Packaged FFmpeg is not the Full Build; missing configuration flags: "
                + ", ".join(missing_flags)
            )
        subprocess.run([
            str(vendor / "bin" / "ffmpeg.exe"), "-hide_banner", "-loglevel", "error",
            "-f", "lavfi", "-i", "sine=frequency=440:duration=0.2",
            "-c:a", "libmp3lame", str(audio),
        ], env=env, cwd=scratch, capture_output=True, check=True, timeout=30)
        result = subprocess.run([
            str(vendor / "bin" / "ffprobe.exe"), "-v", "error", "-show_entries",
            "stream=codec_name", "-of", "json", str(audio),
        ], env=env, cwd=scratch, capture_output=True, text=True, check=True, timeout=30)
        if not any(s.get("codec_name") == "mp3" for s in json.loads(result.stdout)["streams"]):
            raise RuntimeError("Packaged media tools failed the MP3 conversion check")
    print(
        f"Release {version} verified: Full FFmpeg, MP3 conversion, probing, "
        "worker, update SHA-512 and blockmap"
    )


if __name__ == "__main__":
    main()
