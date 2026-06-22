# Write a multiprocessing program to calculate the square of numbers using process class
"""Calculate squares in separate processes using multiprocessing process"""

from __future__ import annotations

import multiprocessing as mp


def calculate_square(number: int, result_queue: mp.Queue[int]) -> None:
    """put the square of a number into the result queue"""

    result_queue.put(number * number)


def main() -> None:
    """start one process per number and collect the squared results"""

    result_queue: mp.Queue[int] = mp.Queue()
    numbers = [2, 3, 4, 5]
    processes = [
        mp.Process(target=calculate_square, args=(number, result_queue))
        for number in numbers
    ]

    for process in processes:
        process.start()
    for process in processes:
        process.join()

    results = [result_queue.get() for _ in numbers]
    print(results)


if __name__ == "__main__":
    main()