# Add a script to render a scatter plot showing age vs salary from the employee dataset
"""draw a scatter plot for age against salary"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def create_employee_points() -> tuple[list[int], list[int]]:
    """build the age and salary values for the scatter plot"""

    ages = [25, 30, 28, 35]
    salaries = [30000, 50000, 45000, 60000]
    return ages, salaries


def ensure_output_dir() -> Path:
    """Make sure the output folder exists"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR


def create_scatter_plot(ages: list[int], salaries: list[int]) -> Path:
    """draw and save the scatter plot"""

    output_path = ensure_output_dir() / "age_salary_scatter.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(ages, salaries, color="#e45756", s=80)
    ax.set_title("age vs salary")
    ax.set_xlabel("age")
    ax.set_ylabel("salary")
    ax.grid(True, linestyle="--", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def main() -> None:
    """create the scatter plot and print the saved path"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        raw_ages = input("enter ages separated by commas (e.g. 25,30,28): ")
        raw_salaries = input("enter salaries separated by commas (e.g. 30000,50000,45000): ")
        try:
            ages = [int(x.strip()) for x in raw_ages.split(",") if x.strip() != ""]
            salaries = [int(x.strip()) for x in raw_salaries.split(",") if x.strip() != ""]
            if len(ages) == 0 or len(salaries) == 0:
                raise ValueError("no values")
            if len(ages) != len(salaries):
                raise ValueError("ages and salaries must match in length")
        except Exception:
            print("invalid input, using sample points instead")
            ages, salaries = create_employee_points()
    else:
        ages, salaries = create_employee_points()

    scatter_path = create_scatter_plot(ages, salaries)
    print(f"scatter plot saved here: {scatter_path}")


if __name__ == "__main__":
    main()