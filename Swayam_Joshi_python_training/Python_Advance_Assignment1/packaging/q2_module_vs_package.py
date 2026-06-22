# Explain the difference between a module and a package with an example.
"""show the practical difference between a module and a package"""

from __future__ import annotations

import q1_utility_module as utility_module
from two_module_package import count_words, square


def demonstrate_module_vs_package() -> dict[str, object]:
    """show how a module and a package are used in practice"""

    return {
        "module_name": utility_module.__name__,
        "module_result": utility_module.add_numbers(2, 3),
        "package_name": square.__module__.split(".")[0],
        "package_result": square(4),
        "package_text_result": count_words("python packaging feels practical"),
        "difference": "a module is one file while a package groups related modules together",
    }


def main() -> None:
    """print a practical module versus package example"""

    print(demonstrate_module_vs_package())


if __name__ == "__main__":
    main()