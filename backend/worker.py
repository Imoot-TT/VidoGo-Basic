from __future__ import annotations

import sys

from download_worker import main as download_main
from metadata_worker import main as metadata_main


def main() -> int:
    mode = str(sys.argv[1] if len(sys.argv) > 1 else "").strip().lower()
    if mode == "download":
        return download_main()
    if mode == "metadata":
        return metadata_main()
    print('{"ok": false, "error": "Worker mode must be download or metadata."}', flush=True)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
