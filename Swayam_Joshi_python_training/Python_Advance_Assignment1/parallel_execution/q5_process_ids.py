# Write a program to create two processes that print their process ids
"""print process ids from two separate child processes"""

from __future__ import annotations

import multiprocessing as mp
import os


def print_process_id(label: str) -> None:
    """print the current process id with a label"""

    print(f"{label}: PID={os.getpid()}")


def main() -> None:
    """start two processes and wait for them to finish"""

    first_process = mp.Process(target=print_process_id, args=("Process-1",))
    second_process = mp.Process(target=print_process_id, args=("Process-2",))
    first_process.start()
    second_process.start()
    first_process.join()
    second_process.join()


if __name__ == "__main__":
    main()