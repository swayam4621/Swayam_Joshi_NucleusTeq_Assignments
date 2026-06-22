# Write a program to create two threads that print numbers from 1 to 5 at the same time
"""Print numbers from two threads using the threading module"""

from __future__ import annotations

import threading
import time


def print_numbers(thread_name: str) -> None:
    """print numbers from 1 to 5 with the provided thread name"""

    for number in range(1, 6):
        print(f"{thread_name}: {number}")
        time.sleep(0.01)


def main() -> None:
    """start two worker threads and wait for them to finish"""

    first_thread = threading.Thread(target=print_numbers, args=("Thread-1",))
    second_thread = threading.Thread(target=print_numbers, args=("Thread-2",))
    first_thread.start()
    second_thread.start()
    first_thread.join()
    second_thread.join()


if __name__ == "__main__":
    main()