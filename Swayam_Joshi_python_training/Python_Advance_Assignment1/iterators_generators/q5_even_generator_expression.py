# Write a generator expression to generate even numbers from 1 to 50
"""use a generator expression to produce even numbers"""

from __future__ import annotations

from collections.abc import Iterator


def generate_even_numbers() -> Iterator[int]:
    """return a generator expression for even numbers between 1 and 50"""

    return (number for number in range(1, 51) if number % 2 == 0)


def main() -> None:
    """Print all even numbers from 1 to 50"""

    print(list(generate_even_numbers()))


if __name__ == "__main__":
    main()