# Create an end-to-end pipeline script that manages a student dataset and generates matplotlib and seaborn visualizations
"""Run a small student performance pipeline from data load to charts"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


OUTPUT_DIR = Path(__file__).resolve().parent / "outputs"


def create_student_dataframe() -> pd.DataFrame:
    """Build the student dataframe used in the mini project"""

    return pd.DataFrame(
        {
            "Name": ["Rahul", "Priya", "Siri", "Anuj"],
            "Marks": [70, 80, 90, 60],
            "Study_Hours": [2, 3, 5, 1],
        }
    )


def add_performance_column(dataframe: pd.DataFrame) -> pd.DataFrame:
    """add a pass or fail column based on marks"""

    student_data = dataframe.copy()
    student_data["Performance"] = student_data["Marks"].apply(
        lambda marks: "Pass" if marks > 65 else "Fail"
    )
    return student_data


def ensure_output_dir() -> Path:
    """make sure the output folder exists"""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OUTPUT_DIR


def plot_line_chart(dataframe: pd.DataFrame) -> Path:
    """draw and save the study hours versus marks line chart"""

    output_path = ensure_output_dir() / "student_line_chart.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(dataframe["Study_Hours"], dataframe["Marks"], marker="o", color="#3b82f6", linewidth=2)
    ax.set_title("study hours vs marks")
    ax.set_xlabel("study hours")
    ax.set_ylabel("marks")
    ax.grid(True, linestyle="--", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def plot_scatter_plot(dataframe: pd.DataFrame) -> Path:
    """draw and save the study hours versus marks scatter plot"""

    output_path = ensure_output_dir() / "student_scatter_plot.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(dataframe["Study_Hours"], dataframe["Marks"], color="#ef4444", s=80)
    ax.set_title("study hours vs marks")
    ax.set_xlabel("study hours")
    ax.set_ylabel("marks")
    ax.grid(True, linestyle="--", alpha=0.3)
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def plot_seaborn_barplot(dataframe: pd.DataFrame) -> Path:
    """draw and save the performance versus marks barplot"""

    output_path = ensure_output_dir() / "student_performance_barplot.png"
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.barplot(data=dataframe, x="Performance", y="Marks", estimator=np.mean, ax=ax, palette="magma")
    ax.set_title("performance vs marks")
    fig.tight_layout()
    fig.savefig(output_path, dpi=150)
    plt.close(fig)
    return output_path


def run_pipeline() -> pd.DataFrame:
    """build the student data, enrich it, and create all charts"""

    student_data = create_student_dataframe()
    student_data = add_performance_column(student_data)
    plot_line_chart(student_data)
    plot_scatter_plot(student_data)
    plot_seaborn_barplot(student_data)
    return student_data


def main() -> None:
    """run the pipeline and print a friendly summary"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        try:
            n = int(input("how many students to enter?: ").strip())
            rows = []
            for i in range(n):
                print(f"enter student {i+1}")
                name = input("name: ").strip()
                marks = float(input("marks: ").strip())
                hours = float(input("study hours: ").strip())
                rows.append({"Name": name, "Marks": marks, "Study_Hours": hours})
            student_df = pd.DataFrame(rows)
            student_df = add_performance_column(student_df)
            plot_line_chart(student_df)
            plot_scatter_plot(student_df)
            plot_seaborn_barplot(student_df)
            student_data = student_df
        except Exception:
            print("invalid input, running pipeline on sample data instead")
            student_data = run_pipeline()
    else:
        student_data = run_pipeline()

    print("here is the student data with the performance column")
    print(student_data)
    print(f"charts were saved in this folder: {ensure_output_dir()}")


if __name__ == "__main__":
    main()