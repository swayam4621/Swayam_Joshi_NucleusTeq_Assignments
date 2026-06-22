# Divide two numbers entered by the user and handle zerodivisionerror
"""divide two numbers while handling zero division safely"""

from __future__ import annotations


def divide_numbers(numerator: float, denominator: float) -> float:
    """return the quotient of two numbers"""

    return numerator / denominator


def main() -> None:
    """run the division example with a graceful input fallback"""

    try:
        raw_numerator = input("Enter numerator: ")
        raw_denominator = input("Enter denominator: ")
    except EOFError:
        raw_numerator = "10"
        raw_denominator = "0"

    try:
        numerator = float(raw_numerator)
        denominator = float(raw_denominator)
        result = divide_numbers(numerator, denominator)
    except ValueError as error:
        print(f"Invalid number provided: {error}")
    except ZeroDivisionError as error:
        print(f"Cannot divide by zero: {error}")
    else:
        print(f"Result: {result}")


if __name__ == "__main__":
    main()