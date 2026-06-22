# write a lambda function to find the square of a number
"""show a typed lambda expression that squares a number"""

from __future__ import annotations

from collections.abc import Callable


square: Callable[[int], int] = lambda number: number * number


def calculate_square(number: int) -> int:
    """return the square of a number using the lambda expression"""

    return square(number)


def main() -> None:
    """print the square of a sample value"""

    print(calculate_square(7))


if __name__ == "__main__":
    main()