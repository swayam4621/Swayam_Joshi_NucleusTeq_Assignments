# Convert a simple loop based program into a functional style using map or filter
"""Transform a loop based task into a functional pipeline"""

from __future__ import annotations


def is_even(number: int) -> bool:
    """return true when the number is even"""

    return number % 2 == 0


def square(number: int) -> int:
    """return the square of a number"""

    return number * number


def functional_even_squares(numbers: list[int]) -> list[int]:
    """return the squares of only the even numbers in the input list"""

    filtered_numbers = filter(is_even, numbers)
    squared_numbers = map(square, filtered_numbers)
    return list(squared_numbers)


def main() -> None:
    """Show a functional replacement for a simple loop"""

    print(functional_even_squares([1, 2, 3, 4, 5, 6]))


if __name__ == "__main__":
    main()