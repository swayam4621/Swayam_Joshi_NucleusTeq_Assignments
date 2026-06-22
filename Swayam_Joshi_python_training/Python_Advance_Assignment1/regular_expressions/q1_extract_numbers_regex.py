# Extract all numbers from a given string using regular expressions
"""Extract all numeric substrings from a string using regex"""

from __future__ import annotations

import re


def extract_numbers(text: str) -> list[str]:
    """return all numbers found in the text"""

    return re.findall(r"\d+", text)


def main() -> None:
    """print numbers extracted from a sample string"""

    print(extract_numbers("Order 15 contains 3 items and 42 units"))


if __name__ == "__main__":
    main()