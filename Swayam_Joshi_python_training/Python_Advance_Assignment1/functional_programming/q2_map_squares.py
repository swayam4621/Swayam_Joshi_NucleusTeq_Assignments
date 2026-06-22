# Use map to convert a list of numbers into their squares
"""Square a list of numbers using map"""

from __future__ import annotations


def square(number: int) -> int:
    """return the square of a number"""

    return number * number


def square_numbers(numbers: list[int]) -> list[int]:
    """return a new list containing the square of each input number"""

    return list(map(square, numbers))


def main() -> None:
    """Show map with a square transformation"""

    print(square_numbers([1, 2, 3, 4]))


if __name__ == "__main__":
    main()