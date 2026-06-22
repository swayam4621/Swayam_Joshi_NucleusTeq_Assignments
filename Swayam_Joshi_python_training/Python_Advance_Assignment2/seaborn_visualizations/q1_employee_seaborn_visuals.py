# Create an advanced visualization module using seaborn and the employee dataset to draw a barplot, boxplot, and heatmap
"""draw a few seaborn charts for the employee dataset"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def create_employee_dataframe() -> pd.DataFrame:
    """build the employee dataframe used for the seaborn charts"""

    return pd.DataFrame(
        {
            "Name": ["Rahul", "Priya", "Amit", "Anuj"],
            "Age": [25, 30, 28, 35],
            "Department": ["HR", "IT", "Finance", "IT"],
            "Salary": [30000, 50000, 45000, 60000],
        }
    )


def ensure_output_dir() -> Path:
    """make sure the output folder exists"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR


def create_barplot(dataframe: pd.DataFrame) -> Path:
    """draw and save the department salary barplot"""

    output_path = ensure_output_dir() / "department_salary_barplot.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.barplot(data=dataframe, x="Department", y="Salary", estimator=np.mean, ax=ax, palette="viridis")
    ax.set_title("department vs salary")
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def create_boxplot(dataframe: pd.DataFrame) -> Path:
    """draw and save the salary boxplot"""

    output_path = ensure_output_dir() / "salary_boxplot.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.boxplot(data=dataframe, y="Salary", ax=ax, color="#4c72b0")
    ax.set_title("salary distribution")
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def create_heatmap(dataframe: pd.DataFrame) -> Path:
    """draw and save the correlation heatmap"""

    output_path = ensure_output_dir() / "age_salary_heatmap.png"
    correlation_data = dataframe[["Age", "Salary"]].corr()
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(correlation_data, annot=True, cmap="coolwarm", ax=ax, vmin=-1, vmax=1)
    ax.set_title("age and salary correlation")
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def main() -> None:
    """create the seaborn charts and print the saved paths"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        try:
            n = int(input("how many employees to enter?: ").strip())
            rows = []
            for i in range(n):
                print(f"enter row {i+1}")
                name = input("name: ").strip()
                age = int(input("age: ").strip())
                dept = input("department: ").strip()
                salary = float(input("salary: ").strip())
                rows.append({"Name": name, "Age": age, "Department": dept, "Salary": salary})
            employee_data = pd.DataFrame(rows)
        except Exception:
            print("invalid input, using sample data instead")
            employee_data = create_employee_dataframe()
    else:
        employee_data = create_employee_dataframe()

    print(f"barplot saved here: {create_barplot(employee_data)}")
    print(f"boxplot saved here: {create_boxplot(employee_data)}")
    print(f"heatmap saved here: {create_heatmap(employee_data)}")


if __name__ == "__main__":
    main()