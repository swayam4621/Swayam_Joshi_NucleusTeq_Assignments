# Convert a normal function into parallel execution using processpoolexecutor
"""Use processpoolexecutor to process values concurrently"""

from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor


def square(number: int) -> int:
    """return the square of a number"""

    return number * number


def run_process_pool(numbers: list[int]) -> list[int]:
    """return squared values computed in parallel processes"""

    with ProcessPoolExecutor() as executor:
        return list(executor.map(square, numbers))


def main() -> None:
    """print a processpoolexecutor example result"""

    print(run_process_pool([1, 2, 3, 4, 5]))


if __name__ == "__main__":
    main()