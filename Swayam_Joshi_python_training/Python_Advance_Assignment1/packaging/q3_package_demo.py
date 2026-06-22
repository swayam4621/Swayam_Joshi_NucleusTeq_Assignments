# Create a package with two modules and include an __init__.py file
"""Show the two module package in action"""

from __future__ import annotations

from two_module_package import count_words, cube, square, to_title_case


def use_two_module_package() -> dict[str, object]:
    """return sample results from the package modules"""

    return {
        "square": square(5),
        "cube": cube(3),
        "title_case": to_title_case("python advance assignment"),
        "word_count": count_words("Python packaging is useful"),
    }


def main() -> None:
    """print the sample package results"""

    print(use_two_module_package())


if __name__ == "__main__":
    main()