# Handle filenotfounderror when trying to open a file
"""handle missing file errors when opening a text file"""

from __future__ import annotations

from pathlib import Path


def read_text_file(file_path: Path) -> str:
    """return the content of a text file"""

    with file_path.open("r", encoding="utf-8") as file_handle:
        return file_handle.read()


def main() -> None:
    """show filenotfounderror handling with a missing file"""

    try:
        content = read_text_file(Path("missing_file.txt"))
    except FileNotFoundError as error:
        print(f"File not found: {error}")
    else:
        print(content)


if __name__ == "__main__":
    main()