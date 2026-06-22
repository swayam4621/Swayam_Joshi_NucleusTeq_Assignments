# Use try except else finally to read a number from a file and print its square
"""read a number from a file and print its square using full exception flow"""

from __future__ import annotations

from pathlib import Path
import tempfile


def print_square_from_file(file_path: Path) -> None:
    """read a number from a file and print the square with try except else finally"""

    file_handle = None
    try:
        file_handle = file_path.open("r", encoding="utf-8")
        raw_value = file_handle.read().strip()
        number = int(raw_value)
    except FileNotFoundError as error:
        print(f"File not found: {error}")
    except ValueError as error:
        print(f"File did not contain a valid integer: {error}")
    else:
        print(f"Square: {number * number}")
    finally:
        if file_handle is not None:
            file_handle.close()


def main() -> None:
    """create a demo file and process it"""

    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8") as temp_file:
        temp_file.write("12")
        temp_path = Path(temp_file.name)

    print_square_from_file(temp_path)


if __name__ == "__main__":
    main()