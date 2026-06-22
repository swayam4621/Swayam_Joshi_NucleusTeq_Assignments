# Show the use of join method in threading
"""to Show how join waits for a thread to complete"""

from __future__ import annotations

import threading
import time


def worker() -> None:
    """simulate a short running task"""

    time.sleep(0.05)
    print("Worker finished")


def main() -> None:
    """start a thread and wait for it with join"""

    thread = threading.Thread(target=worker)
    thread.start()
    print("Waiting for worker...")
    thread.join()
    print("Main thread resumes")


if __name__ == "__main__":
    main()