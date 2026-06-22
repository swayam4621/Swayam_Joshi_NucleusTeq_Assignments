# Replace multiple spaces in a string with a single space using re.sub
"""normalize whitespace by collapsing multiple spaces into one"""

from __future__ import annotations

import re


def normalize_spaces(text: str) -> str:
    """replace runs of whitespace with a single space"""

    return re.sub(r"\s+", " ", text).strip()


def main() -> None:
    """print a normalized string example"""

    print(normalize_spaces("Python    regex   is   powerful."))


if __name__ == "__main__":
    main()