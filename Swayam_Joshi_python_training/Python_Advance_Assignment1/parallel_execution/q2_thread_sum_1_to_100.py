# Create a thread that calculates the sum of numbers from 1 to 100
"""Calculate a sum in a background thread"""

from __future__ import annotations

import threading


def calculate_sum(result_container: dict[str, int]) -> None:
    """Store the sum of numbers from 1 to 100 in the provided container"""

    result_container["sum"] = sum(range(1, 101))


def main() -> None:
    """Launch the worker thread and print the result after join"""

    result_container: dict[str, int] = {}
    worker = threading.Thread(target=calculate_sum, args=(result_container,))
    worker.start()
    worker.join()
    print(result_container["sum"])


if __name__ == "__main__":
    main()