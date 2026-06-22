# Create a plotting script using matplotlib that processes the data to generate a clean bar chart and line chart
"""Draw a bar chart and a line chart for department counts"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def create_chart_data() -> tuple[list[str], list[int]]:
    """build the category labels and values for the charts"""

    departments = ["HR", "IT", "Finance"]
    employees = [5, 12, 7]
    return departments, employees


def ensure_output_dir() -> Path:
    """make sure the output folder exists"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR


def plot_bar_chart(departments: list[str], employees: list[int]) -> Path:
    """draw and save the bar chart"""

    output_path = ensure_output_dir() / "department_bar_chart.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(departments, employees, color=["#4c78a8", "#f58518", "#54a24b"])
    ax.set_title("department wise employee count")
    ax.set_xlabel("department")
    ax.set_ylabel("employees")
    ax.grid(axis="y", linestyle="--", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def plot_line_chart(departments: list[str], employees: list[int]) -> Path:
    """draw and save the line chart"""

    output_path = ensure_output_dir() / "department_line_chart.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(departments, employees, marker="o", color="#d45087", linewidth=2)
    ax.set_title("department wise employee trend")
    ax.set_xlabel("department")
    ax.set_ylabel("employees")
    ax.grid(True, linestyle="--", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def main() -> None:
    """create both charts and print where they were saved"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        try:
            n = int(input("how many departments?: ").strip())
            departments = []
            employees = []
            for i in range(n):
                departments.append(input(f"department {i+1} name: ").strip())
                employees.append(int(input(f"department {i+1} employee count: ").strip()))
        except Exception:
            print("invalid input, using sample data instead")
            departments, employees = create_chart_data()
    else:
        departments, employees = create_chart_data()

    bar_path = plot_bar_chart(departments, employees)
    line_path = plot_line_chart(departments, employees)
    print(f"bar chart saved here: {bar_path}")
    print(f"line chart saved here: {line_path}")


if __name__ == "__main__":
    main()