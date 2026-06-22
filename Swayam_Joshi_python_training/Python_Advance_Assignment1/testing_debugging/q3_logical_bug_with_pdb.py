# Create a function with a logical bug and use pdb to identify the issue
"""Show a buggy function and a pdb based inspection helper"""

from __future__ import annotations

import pdb


def calculate_discounted_total(price: float, discount_percentage: float) -> float:
    """return a discounted price but this it intentionally contains a logic bug"""

    discount_amount = price * (discount_percentage / 100)
    return price + discount_amount


def debug_discount_calculation(price: float, discount_percentage: float) -> float:
    """pause in pdb so the discount calculation can be inspected"""

    pdb.set_trace()
    return calculate_discounted_total(price, discount_percentage)


def main() -> None:
    """show the wrong calculation without entering the debugger automatically"""

    print(calculate_discounted_total(100.0, 10.0))


if __name__ == "__main__":
    main()