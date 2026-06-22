# Write a program that processes a large dataset using a generator instead of storing all values in a list
"""Process a large synthetic dataset lazily with a generator"""

from __future__ import annotations

from collections.abc import Iterator


def generate_dataset(size: int) -> Iterator[int]:
    """create a synthetic dataset one value at a time"""

    for value in range(1, size + 1):
        yield value


def process_dataset(size: int) -> dict[str, float]:
    """Calculate summary statistics without loading the full dataset into memory"""

    total = 0
    count = 0

    for value in generate_dataset(size):
        total += value
        count += 1

    average = total / count if count > 0 else 0.0
    return {
        "count": float(count),
        "total": float(total),
        "average": average,
    }


def main() -> None:
    """show generator based processing on a large dataset size"""

    print(process_dataset(1000))


if __name__ == "__main__":
    main()