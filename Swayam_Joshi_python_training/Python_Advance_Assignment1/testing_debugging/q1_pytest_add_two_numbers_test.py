# Write pytest test cases for a function that adds two numbers.
"""Provide pytest coverage for a simple addition function."""

from __future__ import annotations

import pytest


def add_two_numbers(first: int, second: int) -> int:
    """Return the sum of two integers."""

    return first + second


@pytest.mark.parametrize(
    ("first", "second", "expected"),
    [
        (1, 2, 3),
        (-1, 5, 4),
        (0, 0, 0),
    ],
)
def test_add_two_numbers(first: int, second: int, expected: int) -> None:
    """Verify that addition returns the expected total."""

    assert add_two_numbers(first, second) == expected


if __name__ == "__main__":
    print(add_two_numbers(2, 3))