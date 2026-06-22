# Write a pattern to check if a string contains only alphabets
"""Check whether a string contains only alphabetic characters"""

from __future__ import annotations

import re


ALPHABET_PATTERN = re.compile(r"^[A-Za-z]+$")


def contains_only_alphabets(text: str) -> bool:
    """return true when text contains only letters"""

    return ALPHABET_PATTERN.fullmatch(text) is not None


def main() -> None:
    """print a sample alphabet only check"""

    print(contains_only_alphabets("NucleusTeq"))


if __name__ == "__main__":
    main()