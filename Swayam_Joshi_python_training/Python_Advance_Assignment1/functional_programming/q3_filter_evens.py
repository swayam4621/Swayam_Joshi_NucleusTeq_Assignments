# Use filter to extract even numbers from a list
"""extract even numbers from a list using filter"""

from __future__ import annotations


def is_even(number: int) -> bool:
    """return true when the number is even"""

    return number % 2 == 0


def filter_even_numbers(numbers: list[int]) -> list[int]:
    """return only the even values from the input list"""

    return list(filter(is_even, numbers))


def main() -> None:
    """Print a filtered list of even numbers"""

    print(filter_even_numbers([1, 2, 3, 4, 5, 6]))


if __name__ == "__main__":
    main()