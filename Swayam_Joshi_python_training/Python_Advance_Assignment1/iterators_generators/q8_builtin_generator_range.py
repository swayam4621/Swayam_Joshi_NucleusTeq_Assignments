# Show an example of a built in generator like range and iterate over it
"""show iteration over the built in range object"""

from __future__ import annotations


def collect_range_values(limit: int) -> list[int]:
    """collect values from a range object"""

    return list(range(limit))


def main() -> None:
    """Print a small range demonstration"""

    for value in range(5):
        print(value)


if __name__ == "__main__":
    main()