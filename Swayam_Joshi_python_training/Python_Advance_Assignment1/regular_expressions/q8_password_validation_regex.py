# Create a password validation program using regex with minimum length, one digit, and one special character
"""Validate passwords with minimum strength requirements"""

from __future__ import annotations

import re


PASSWORD_PATTERN = re.compile(r"^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$")


def is_strong_password(password: str) -> bool:
    """return true if the password satisfies the minimum rules"""

    return PASSWORD_PATTERN.fullmatch(password) is not None


def main() -> None:
    """print a sample password validation result"""

    print(is_strong_password("Demo@123"))


if __name__ == "__main__":
    main()