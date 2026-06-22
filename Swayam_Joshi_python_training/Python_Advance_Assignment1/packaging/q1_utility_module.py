# Create a module with two utility functions and import it into another python file
"""Make two small utility functions for reuse in other files"""

from __future__ import annotations


def add_numbers(first: int, second: int) -> int:
    """return the sum of two integers"""

    return first + second


def multiply_numbers(first: int, second: int) -> int:
    """return the product of two integers"""

    return first * second