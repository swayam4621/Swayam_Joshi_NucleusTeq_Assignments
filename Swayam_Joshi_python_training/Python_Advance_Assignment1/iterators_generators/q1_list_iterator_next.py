#Create an iterator for a list and print elements using next
"""Iterate over a list manually using next"""

from __future__ import annotations


def iterate_with_next(items: list[str]) -> list[str]:
    """Collect list items by repeatedly calling next on an iterator"""

    iterator = iter(items)
    collected_items: list[str] = []

    while True:
        try:
            collected_items.append(next(iterator))
        except StopIteration:
            break

    return collected_items


def main() -> None:
    """show list iteration with next"""

    items = ["apple", "banana", "cherry"]
    for item in iterate_with_next(items):
        print(item)


if __name__ == "__main__":
    main()