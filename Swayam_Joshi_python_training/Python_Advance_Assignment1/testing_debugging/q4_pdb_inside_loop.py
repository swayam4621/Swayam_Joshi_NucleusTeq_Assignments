# Use pdb breakpoints inside a loop and inspect variable values
"""show inserting a pdb breakpoint inside a loop"""

from __future__ import annotations

import pdb


def process_numbers(numbers: list[int], enable_debugger: bool = False) -> int:
    """sum numbers and optionally stop inside the loop for inspection"""

    total = 0
    for index, number in enumerate(numbers):
        if enable_debugger and index == 2:
            pdb.set_trace()
        total += number
    return total


def main() -> None:
    """run the loop processing example with the debugger disabled by default"""

    print(process_numbers([1, 2, 3, 4, 5]))


if __name__ == "__main__":
    main()