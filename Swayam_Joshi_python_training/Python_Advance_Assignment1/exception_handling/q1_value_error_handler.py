# Take a number as input and handle valueerror if the input is not a valid integer
"""validate integer input with simple valueerror handling"""

from __future__ import annotations


def parse_integer(raw_value: str) -> int:
    """convert raw text into an integer"""

    return int(raw_value)


def main() -> None:
    """run the integer parsing example with a safe fallback input"""

    try:
        raw_value = input("Enter an integer: ")
    except EOFError:
        raw_value = "42"

    try:
        number = parse_integer(raw_value)
    except ValueError as error:
        print(f"Invalid integer input: {error}")
    else:
        print(f"Valid integer: {number}")


if __name__ == "__main__":
    main()