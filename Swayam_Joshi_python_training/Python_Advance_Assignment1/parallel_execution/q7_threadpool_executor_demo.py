# Convert a normal function into parallel execution using threadpoolexecutor
"""Use threadpoolexecutor to process values concurrently"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor


def square(number: int) -> int:
    """return the square of a number"""

    return number * number


def run_thread_pool(numbers: list[int]) -> list[int]:
    """return squared values computed in parallel threads"""

    with ThreadPoolExecutor() as executor:
        return list(executor.map(square, numbers))


def main() -> None:
    """print a threadpoolexecutor example result"""

    print(run_thread_pool([1, 2, 3, 4, 5]))


if __name__ == "__main__":
    main()