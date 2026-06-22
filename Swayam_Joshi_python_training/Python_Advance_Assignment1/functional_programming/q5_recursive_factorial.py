# Write a recursive function to calculate factorial
"""Calculate factorial recursively"""

from __future__ import annotations


def factorial(number: int) -> int:
    """return the factorial of a non negative integer"""

    if number < 0:
        raise ValueError("Factorial is not defined for negative numbers.")
    if number in (0, 1):
        return 1

    return number * factorial(number - 1)


def main() -> None:
    """print the factorial of a sample number"""

    print(factorial(5))


if __name__ == "__main__":
    main()