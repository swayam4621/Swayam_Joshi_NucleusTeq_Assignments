# Write a generator function that yields square numbers up to n
"""generate square numbers up to a given limit"""

from __future__ import annotations

from collections.abc import Iterator


def generate_squares(limit: int) -> Iterator[int]:
    """Find square numbers from 1 up to the provided limit"""

    for number in range(1, limit + 1):
        yield number * number


def main() -> None:
    """print square numbers : lazily"""

    print(list(generate_squares(5)))


if __name__ == "__main__":
    main()