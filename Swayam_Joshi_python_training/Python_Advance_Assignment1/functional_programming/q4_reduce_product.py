# Use reduce to find the product of all elements in a list
"""multiply all numbers in a list using reduce"""

from __future__ import annotations

from functools import reduce


def product_of_numbers(numbers: list[int]) -> int:
    """return the product of all numbers in the list"""

    return reduce(lambda accumulator, number: accumulator * number, numbers, 1)


def main() -> None:
    """print the product of a sample list"""

    print(product_of_numbers([2, 3, 4, 5]))


if __name__ == "__main__":
    main()