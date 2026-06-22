# Use re search to check whether a word exists in a sentence
"""Check whether a word exists in a sentence with re search"""

from __future__ import annotations

import re


def contains_word(sentence: str, word: str) -> bool:
    """return true if the word appears in the sentence as a whole word"""

    pattern = rf"\b{re.escape(word)}\b"
    return re.search(pattern, sentence) is not None


def main() -> None:
    """Print a sample word search result"""

    print(contains_word("Python is fun to learn.", "Python"))


if __name__ == "__main__":
    main()