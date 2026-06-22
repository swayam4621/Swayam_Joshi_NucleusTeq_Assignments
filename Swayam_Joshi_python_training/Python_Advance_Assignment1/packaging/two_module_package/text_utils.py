"""Text helpers for the two module package"""

from __future__ import annotations


def to_title_case(text: str) -> str:
    """return the text in title case"""

    return text.title()


def count_words(text: str) -> int:
    """return the number of words in a string"""

    return len(text.split())