from __future__ import annotations

from pathlib import Path
import shutil
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
VENDOR_DIR = ROOT / "build" / "vendor"
WORK_DIR = ROOT / "build" / "pyinstaller"


def require_command(name: str) -> Path:
    command = shutil.which(name)
    if not command:
        raise RuntimeError(f"Required build command was not found: {name}")
    return Path(command)


def build_worker() -> None:
    command = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        "--onefile",
        "--name",
        "vidogo-worker",
        "--distpath",
        str(VENDOR_DIR),
        "--workpath",
        str(WORK_DIR / "work"),
        "--specpath",
        str(WORK_DIR),
        "--collect-all",
        "yt_dlp",
        "--collect-all",
        "curl_cffi",
        str(ROOT / "backend" / "worker.py"),
    ]
    subprocess.run(command, cwd=ROOT, check=True)


def copy_media_tools() -> None:
    bin_dir = VENDOR_DIR / "bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    for name in ("ffmpeg", "ffprobe"):
        source = require_command(name)
        destination = bin_dir / f"{name}.exe"
        shutil.copy2(source, destination)
        print(f"Copied {source} -> {destination}")


def main() -> int:
    VENDOR_DIR.mkdir(parents=True, exist_ok=True)
    build_worker()
    copy_media_tools()
    worker_path = VENDOR_DIR / "vidogo-worker.exe"
    if not worker_path.exists():
        raise RuntimeError(f"Worker build did not produce {worker_path}")
    print(f"Prepared packaged backend: {worker_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
