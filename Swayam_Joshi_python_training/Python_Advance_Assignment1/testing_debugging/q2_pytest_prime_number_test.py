# Write pytest test cases for a function that checks whether a number is prime
"""Provide pytest coverage for a prime checking function"""

from __future__ import annotations

import pytest


def is_prime(number: int) -> bool:
    """return true when the given number is prime"""

    if number < 2:
        return False

    for divisor in range(2, int(number ** 0.5) + 1):
        if number % divisor == 0:
            return False

    return True


@pytest.mark.parametrize(
    ("number", "expected"),
    [
        (2, True),
        (3, True),
        (4, False),
        (17, True),
        (1, False),
    ],
)
def test_is_prime(number: int, expected: bool) -> None:
    """verify prime detection across prime and composite values"""

    assert is_prime(number) is expected


if __name__ == "__main__":
    print(is_prime(11))