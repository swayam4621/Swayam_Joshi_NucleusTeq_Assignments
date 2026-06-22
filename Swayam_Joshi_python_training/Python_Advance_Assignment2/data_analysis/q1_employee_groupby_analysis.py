# Create an analysis script using the employee dataset to find average salary by department, max salary by department, and count total employees per department using groupby
"""Analyze the employee data with a few simple groupby summaries"""

from __future__ import annotations

import pandas as pd


def create_employee_dataframe() -> pd.DataFrame:
    """build the employee dataframe used for the analysis"""

    return pd.DataFrame(
        {
            "Name": ["Rahul", "Priya", "Amit", "Anuj"],
            "Age": [25, 30, 28, 35],
            "Department": ["HR", "IT", "Finance", "IT"],
            "Salary": [30000, 50000, 45000, 60000],
        }
    )


def average_salary_by_department(dataframe: pd.DataFrame) -> pd.Series:
    """Return the average salary for each department"""

    return dataframe.groupby("Department")["Salary"].mean()


def max_salary_by_department(dataframe: pd.DataFrame) -> pd.Series:
    """return the max salary for each department"""

    return dataframe.groupby("Department")["Salary"].max()


def employee_count_by_department(dataframe: pd.DataFrame) -> pd.Series:
    """return the number of employees in each department"""

    return dataframe.groupby("Department")["Name"].count()


def main() -> None:
    """print the groupby summaries in a readable format"""
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

    print("average salary by department")
    print(average_salary_by_department(employee_data))
    print("max salary by department")
    print(max_salary_by_department(employee_data))
    print("employee count by department")
    print(employee_count_by_department(employee_data))


if __name__ == "__main__":
    main()