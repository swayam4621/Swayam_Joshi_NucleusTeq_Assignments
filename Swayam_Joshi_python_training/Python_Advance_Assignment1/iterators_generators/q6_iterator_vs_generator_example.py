# Explain the difference between iterator and generator with a small example
"""Compare an iterator and a generator using small runnable examples"""

from __future__ import annotations

from collections.abc import Iterator


class CounterIterator:
    """simple custom iterator implementation"""

    def __init__(self, limit: int) -> None:
        """Store the limit and initialize the counter"""

        self.limit = limit
        self.current = 0

    def __iter__(self) -> CounterIterator:
        """return the iterator itself"""

        return self

    def __next__(self) -> int:
        """return the next integer in sequence"""

        if self.current >= self.limit:
            raise StopIteration

        self.current += 1
        return self.current


def counter_generator(limit: int) -> Iterator[int]:
    """yield integers up to the provided limit"""

    for number in range(1, limit + 1):
        yield number


def explain_difference() -> dict[str, list[int]]:
    """return example outputs for the iterator and generator"""

    iterator_values = list(CounterIterator(3))
    generator_values = list(counter_generator(3))
    return {
        "iterator": iterator_values,
        "generator": generator_values,
    }


def main() -> None:
    """show the difference between iterator and generator"""

    examples = explain_difference()
    print("Iterator is class with __iter__ and __next__ methods")
    print("Generator is the function with yield that produces values lazily")
    print(examples)


if __name__ == "__main__":
    main()