# Create a script that initializes two arrays, arr_1 = [1,2,3] and arr_2 = [4,5,6], and performs element-wise addition and multiplication
"""show element wise addition and multiplication with numpy arrays"""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray


def create_input_arrays() -> tuple[NDArray[np.int64], NDArray[np.int64]]:
    """build the two arrays used for the operation demo"""

    arr_1 = np.array([1, 2, 3], dtype=np.int64)
    arr_2 = np.array([4, 5, 6], dtype=np.int64)
    return arr_1, arr_2


def perform_operations(
    arr_1: NDArray[np.int64], arr_2: NDArray[np.int64]
) -> dict[str, NDArray[np.int64]]:
    """Calculate the requested array operations"""

    return {
        "addition": arr_1 + arr_2,
        "multiplication": arr_1 * arr_2,
    }


def main() -> None:
    """print the array operation results"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        raw1 = input("enter first array numbers separated by commas (e.g. 1,2,3): ")
        raw2 = input("enter second array numbers separated by commas (e.g. 4,5,6): ")
        try:
            arr_1 = np.array([int(x.strip()) for x in raw1.split(",") if x.strip() != ""], dtype=np.int64)
            arr_2 = np.array([int(x.strip()) for x in raw2.split(",") if x.strip() != ""], dtype=np.int64)
            if arr_1.size == 0 or arr_2.size == 0:
                raise ValueError("no values")
            if arr_1.size != arr_2.size:
                raise ValueError("arrays must be the same length")
        except Exception:
            print("invalid input, using sample arrays instead")
            arr_1, arr_2 = create_input_arrays()
    else:
        arr_1, arr_2 = create_input_arrays()

    results = perform_operations(arr_1, arr_2)
    print(f"first array: {arr_1}")
    print(f"second array: {arr_2}")
    print(f"element wise addition: {results['addition']}")
    print(f"element wise multiplication: {results['multiplication']}")


if __name__ == "__main__":
    main()