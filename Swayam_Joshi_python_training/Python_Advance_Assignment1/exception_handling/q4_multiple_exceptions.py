# Handle multiple exceptions in a single program
"""show handling multiple exceptions in one program"""

from __future__ import annotations


def safe_access_and_divide(values: list[int], index: int, divisor: int) -> float:
    """access a list element and divide it by a divisor"""

    return values[index] / divisor


def main() -> None:
    """run the multiple exception example with safe sample values"""

    values = [10, 20, 30]
    try:
        result = safe_access_and_divide(values, index=5, divisor=0)
    except IndexError as error:
        print(f"Index problem: {error}")
    except ZeroDivisionError as error:
        print(f"Division problem: {error}")
    except TypeError as error:
        print(f"Type problem: {error}")
    else:
        print(f"Result: {result}")


if __name__ == "__main__":
    main()