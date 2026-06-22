# Use re.findall to extract all words starting with a capital letter
"""extract words that start with a capital letter using regex"""

from __future__ import annotations

import re


def find_capitalized_words(text: str) -> list[str]:
    """return all capitalized words in the text"""

    return re.findall(r"\b[A-Z][a-zA-Z]*\b", text)


def main() -> None:
    """print capitalized words from a sample string"""

    print(find_capitalized_words("Python and Java are Popular Languages."))


if __name__ == "__main__":
    main()