# Create a module with two utility functions and import it into another python file
"""Import and use the utility module in a separate file"""

from __future__ import annotations

import q1_utility_module as utility_module


def show_utility_import() -> dict[str, int]:
    """Use the utility module functions and return sample results"""

    return {
        "sum": utility_module.add_numbers(3, 4),
        "product": utility_module.multiply_numbers(3, 4),
    }


def main() -> None:
    """Print the imported utility function results"""

    print(show_utility_import())


if __name__ == "__main__":
    main()