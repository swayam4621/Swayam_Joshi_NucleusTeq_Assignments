# Create a custom exception called ageexception and raise it if age is less than 18
"""validate age using a custom ageexception"""

from __future__ import annotations


class AgeException(ValueError):
    """raised when the provided age is below the allowed threshold"""


def validate_age(age: int) -> None:
    """raise ageexception if the age is below 18"""

    if age < 18:
        raise AgeException("Age must be atleast 18.")


def main() -> None:
    """run the custom exception example with a safe fallback"""

    try:
        raw_age = input("Enter age: ")
    except EOFError:
        raw_age = "16"

    try:
        age = int(raw_age)
        validate_age(age)
    except AgeException as error:
        print(f"Age validation failed: {error}")
    except ValueError as error:
        print(f"Invalid age input: {error}")
    else:
        print(f"Age accepted: {age}")


if __name__ == "__main__":
    main()