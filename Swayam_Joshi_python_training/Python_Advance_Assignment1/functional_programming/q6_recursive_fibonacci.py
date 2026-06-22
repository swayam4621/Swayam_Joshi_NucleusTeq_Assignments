# Write a recursive function to calculate fibonacci
"""calculate fibonacci numbers recursively"""

from __future__ import annotations


def fibonacci(number: int) -> int:
    """Return the nth fibonacci number with recursion"""

    if number < 0:
        raise ValueError("Fibonacci is not defined for negative numbers")
    if number in (0, 1):
        return number

    return fibonacci(number - 1) + fibonacci(number - 2)


def main() -> None:
    """Print a sample fibonacci value"""

    print(fibonacci(10))


if __name__ == "__main__":
    main()