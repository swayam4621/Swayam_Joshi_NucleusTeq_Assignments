# Create multiple threads to simulate file downloading using time.sleep
"""Simulate concurrent downloads with multiple threads"""

from __future__ import annotations

import threading
import time


def download_file(file_name: str, delay_seconds: float) -> None:
    """simulate downloading a file by sleeping for a short duration"""

    print(f"Starting {file_name}")
    time.sleep(delay_seconds)
    print(f"Finished {file_name}")


def main() -> None:
    """launch several download threads and wait for completion"""

    files = [
        ("file_a.txt", 0.05),
        ("file_b.txt", 0.03),
        ("file_c.txt", 0.04),
    ]
    threads = [
        threading.Thread(target=download_file, args=(file_name, delay))
        for file_name, delay in files
    ]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()


if __name__ == "__main__":
    main()