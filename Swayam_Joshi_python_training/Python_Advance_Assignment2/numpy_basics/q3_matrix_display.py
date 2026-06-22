# create a script that generates and displays a 3x3 matrix using numpy
"""create and display a small 3 by 3 matrix"""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray


def create_matrix() -> NDArray[np.int64]:
    """build the 3 by 3 matrix for the exercise"""

    return np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=np.int64)


def format_matrix(matrix: NDArray[np.int64]) -> str:
    """Format the matrix for a clean console display"""

    return np.array2string(matrix)


def main() -> None:
    """print the matrix in a simple readable form"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        print("enter 9 integers separated by commas for a 3x3 matrix")
        raw = input("e.g. 1,2,3,4,5,6,7,8,9: ")
        try:
            vals = [int(x.strip()) for x in raw.split(",") if x.strip() != ""]
            if len(vals) != 9:
                raise ValueError("need 9 values")
            matrix = np.array([vals[0:3], vals[3:6], vals[6:9]], dtype=np.int64)
        except Exception:
            print("invalid input, using sample matrix instead")
            matrix = create_matrix()
    else:
        matrix = create_matrix()

    print("here is the 3 by 3 matrix")
    print(format_matrix(matrix))


if __name__ == "__main__":
    main()