# Create a function that raises a valueerror if a number is negative
"""raise a valueerror when a negative number is supplied"""

from __future__ import annotations


def ensure_non_negative(number: int) -> int:
    """return the number or raise valueerror if it is negative"""

    if number < 0:
        raise ValueError("Number cannot be negative.")

    return number


def main() -> None:
    """show the negative number validation function"""

    try:
        value = ensure_non_negative(-5)
    except ValueError as error:
        print(f"Validation failed: {error}")
    else:
        print(f"Accepted number: {value}")


if __name__ == "__main__":
    main()