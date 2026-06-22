# Write a generator to produce fibonacci numbers
"""generate a finite fibonacci sequence lazily"""

from __future__ import annotations

from collections.abc import Iterator


def generate_fibonacci(count: int) -> Iterator[int]:
    """Yield the first count fibonacci numbers"""

    first = 0
    second = 1
    for _ in range(count):
        yield first
        first, second = second, first + second


def main() -> None:
    """print the first few fibonacci numbers"""

    print(list(generate_fibonacci(10)))


if __name__ == "__main__":
    main()