# Create a package for mathematical operations and use it
"""Import and use the math operations package"""

from __future__ import annotations

from math_operations import add, divide, multiply, subtract


def use_math_operations() -> dict[str, float]:
    """return sample results from the math operations package"""

    return {
        "add": add(10, 5),
        "subtract": subtract(10, 5),
        "multiply": multiply(10, 5),
        "divide": divide(10, 5),
    }


def main() -> None:
    """print sample math operation results"""

    print(use_math_operations())


if __name__ == "__main__":
    main()