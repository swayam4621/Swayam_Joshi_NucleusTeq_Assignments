# Create a script that initializes a pandas dataframe for employees and executes the requested operations in structured sub-functions
"""Work with a small employee dataframe in a few focused steps"""

from __future__ import annotations

import pandas as pd


def create_employee_dataframe() -> pd.DataFrame:
    """Build the employee dataframe used throughout the exercise"""

    return pd.DataFrame(
        {
            "Name": ["Rahul", "Priya", "Amit", "Anuj"],
            "Age": [25, 30, 28, 35],
            "Department": ["HR", "IT", "Finance", "IT"],
            "Salary": [30000, 50000, 45000, 60000],
        }
    )


def show_first_two_rows(dataframe: pd.DataFrame) -> pd.DataFrame:
    """return the first two rows of the dataframe"""

    return dataframe.head(2)


def show_summary_statistics(dataframe: pd.DataFrame) -> pd.DataFrame:
    """return summary statistics for the numeric columns"""

    return dataframe.describe()


def show_it_employees(dataframe: pd.DataFrame) -> pd.DataFrame:
    """return only the employees who work in it"""

    return dataframe[dataframe["Department"] == "IT"]


def add_bonus_column(dataframe: pd.DataFrame) -> pd.DataFrame:
    """add a bonus column based on salary"""

    employee_data = dataframe.copy()
    employee_data["Bonus"] = employee_data["Salary"] * 0.10
    return employee_data


def main() -> None:
    """print the dataframe outputs in a friendly sequence"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        try:
            n = int(input("how many employees to enter?: ").strip())
            rows = []
            for i in range(n):
                print(f"enter row {i+1} values")
                name = input("name: ").strip()
                age = float(input("age: ").strip())
                dept = input("department: ").strip()
                salary = float(input("salary: ").strip())
                rows.append({"Name": name, "Age": age, "Department": dept, "Salary": salary})
            employee_data = pd.DataFrame(rows)
        except Exception:
            print("invalid input, using sample data instead")
            employee_data = create_employee_dataframe()
    else:
        employee_data = create_employee_dataframe()

    print("here is the employee table")
    print(employee_data)
    print("first two rows")
    print(show_first_two_rows(employee_data))
    print("summary statistics")
    print(show_summary_statistics(employee_data))
    print("it employees")
    print(show_it_employees(employee_data))
    print("employee data with bonus")
    print(add_bonus_column(employee_data))


if __name__ == "__main__":
    main()