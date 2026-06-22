# Write a regular expression to validate an email address
"""validate email addresses with a regular expression"""

from __future__ import annotations

import re


EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def is_valid_email(email: str) -> bool:
    """return true if the email address matches the validation pattern"""

    return EMAIL_PATTERN.fullmatch(email) is not None


def main() -> None:
    """print whether a sample email is valid"""

    print(is_valid_email("student@example.com"))


if __name__ == "__main__":
    main()