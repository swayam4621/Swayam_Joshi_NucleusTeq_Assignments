"""Mathematical operations for the math operations package"""

from __future__ import annotations


def add(first: float, second: float) -> float:
    """returns sum"""

    return first + second


def subtract(first: float, second: float) -> float:
    """return the difference"""

    return first - second


def multiply(first: float, second: float) -> float:
    """Return the product"""

    return first * second


def divide(first: float, second: float) -> float:
    """returns quotient"""

    if second == 0:
        raise ZeroDivisionError("Cannot divide by zero")

    return first / second