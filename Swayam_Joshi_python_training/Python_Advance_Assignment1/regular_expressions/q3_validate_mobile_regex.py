# Write a regular expression to validate a 10 digit mobile number
"""validate ten digit mobile numbers using regex"""

from __future__ import annotations

import re


MOBILE_PATTERN = re.compile(r"^\d{10}$")


def is_valid_mobile(number: str) -> bool:
    """return true when the string contains exactly 10 digits"""

    return MOBILE_PATTERN.fullmatch(number) is not None


def main() -> None:
    """print whether a sample number is valid"""

    print(is_valid_mobile("9876543210"))


if __name__ == "__main__":
    main()