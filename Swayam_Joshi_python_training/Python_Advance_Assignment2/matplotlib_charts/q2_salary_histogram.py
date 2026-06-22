# Extend the plotting script or add a new file to generate a histogram using salaries
"""Draw a simple salary histogram with matplotlib"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def ensure_output_dir() -> Path:
    """make sure the output folder exists"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR


def create_salary_histogram(salaries: list[int]) -> Path:
    """draw and save the salary histogram"""

    output_path = ensure_output_dir() / "salary_histogram.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(salaries, bins=5, color="#72b7b2", edgecolor="white")
    ax.set_title("salary distribution")
    ax.set_xlabel("salary")
    ax.set_ylabel("frequency")
    ax.grid(axis="y", linestyle="--", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def main() -> None:
    """create the histogram and print the saved path"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        raw = input("enter salaries separated by commas (e.g. 30000,40000,50000): ")
        try:
            salaries = [int(x.strip()) for x in raw.split(",") if x.strip() != ""]
            if len(salaries) == 0:
                raise ValueError("no values")
        except Exception:
            print("invalid input, using sample salaries instead")
            salaries = [30000, 40000, 50000, 60000, 45000]
    else:
        salaries = [30000, 40000, 50000, 60000, 45000]

    histogram_path = create_salary_histogram(salaries)
    print(f"histogram saved here: {histogram_path}")


if __name__ == "__main__":
    main()