# catch all exceptions and print the error message
"""catch any exception and print its message"""

from __future__ import annotations


def risky_operation(raw_value: str) -> int:
    """convert text to integer and perform a simple calculation"""

    return 100 // int(raw_value)


def main() -> None:
    """run the catch all example with a safe fallback input"""

    try:
        raw_value = input("Enter a number: ")
    except EOFError:
        raw_value = "0"

    try:
        result = risky_operation(raw_value)
    except Exception as error:
        print(f"An error occurred: {error}")
    else:
        print(f"Result: {result}")


if __name__ == "__main__":
    main()