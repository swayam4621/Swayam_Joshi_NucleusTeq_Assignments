# Create a script that initializes a numpy array with [10, 20, 30, 40, 50] and calculates its mean, max, min, and sum
"""show simple numpy statistics for a small array"""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray


def create_sample_array() -> NDArray[np.int64]:
    """build the sample array used in this exercise"""

    return np.array([10, 20, 30, 40, 50], dtype=np.int64)


def calculate_statistics(values: NDArray[np.int64]) -> dict[str, float]:
    """calculate the core statistics for the array"""

    return {
        "mean": float(np.mean(values)),
        "max": float(np.max(values)),
        "min": float(np.min(values)),
        "sum": float(np.sum(values)),
    }


def main() -> None:
    """print the array statistics in a friendly way"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        raw = input("enter numbers separated by commas (e.g. 10,20,30): ")
        try:
            values = np.array([int(x.strip()) for x in raw.split(",") if x.strip() != ""], dtype=np.int64)
            if values.size == 0:
                raise ValueError("no values")
        except Exception:
            print("invalid input, using sample array instead")
            values = create_sample_array()
    else:
        values = create_sample_array()

    statistics = calculate_statistics(values)
    print(f"here is the array: {values}")
    print(f"mean value: {statistics['mean']}")
    print(f"max value: {statistics['max']}")
    print(f"min value: {statistics['min']}")
    print(f"sum value: {statistics['sum']}")


if __name__ == "__main__":
    main()