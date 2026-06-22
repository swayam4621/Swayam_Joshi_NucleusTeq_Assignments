# Create a script that builds the missing value dataset and implements data cleaning routines
"""Clean a small dataset that contains missing values"""

from __future__ import annotations

import pandas as pd


def create_dirty_dataset() -> pd.DataFrame:
    """build the dataset with missing age and salary values"""

    return pd.DataFrame(
        {
            "Name": ["Rahul", "Priya", "Anuj"],
            "Age": [25.0, None, 29.0],
            "Salary": [30000.0, 40000.0, None],
        }
    )


def detect_missing_values(dataframe: pd.DataFrame) -> pd.Series:
    """return the missing value count for each column"""

    return dataframe.isna().sum()


def fill_missing_age_with_mean(dataframe: pd.DataFrame) -> pd.DataFrame:
    """replace missing age values with the column mean"""

    cleaned_data = dataframe.copy()
    cleaned_data["Age"] = cleaned_data["Age"].fillna(cleaned_data["Age"].mean())
    return cleaned_data


def fill_missing_salary_with_zero(dataframe: pd.DataFrame) -> pd.DataFrame:
    """replace missing salary values with zero"""

    cleaned_data = dataframe.copy()
    cleaned_data["Salary"] = cleaned_data["Salary"].fillna(0)
    return cleaned_data


def clean_dataset(dataframe: pd.DataFrame) -> pd.DataFrame:
    """apply the requested cleaning steps in sequence"""

    cleaned_data = fill_missing_age_with_mean(dataframe)
    cleaned_data = fill_missing_salary_with_zero(cleaned_data)
    return cleaned_data


def main() -> None:
    """print the dirty data, missing values, and cleaned result"""
    use_custom = input("do you want to add data? (y/n): ").strip().lower().startswith("y")
    if use_custom:
        try:
            n = int(input("how many rows to enter?: ").strip())
            rows = []
            for i in range(n):
                print(f"row {i+1}")
                name = input("name: ").strip()
                age_raw = input("age (leave blank for missing): ").strip()
                age = float(age_raw) if age_raw != "" else None
                salary_raw = input("salary (leave blank for missing): ").strip()
                salary = float(salary_raw) if salary_raw != "" else None
                rows.append({"Name": name, "Age": age, "Salary": salary})
            dirty_data = pd.DataFrame(rows)
        except Exception:
            print("invalid input, using sample dataset instead")
            dirty_data = create_dirty_dataset()
    else:
        dirty_data = create_dirty_dataset()

    print("here is the dataset with missing values")
    print(dirty_data)
    print("missing values by column")
    print(detect_missing_values(dirty_data))
    print("cleaned dataset")
    print(clean_dataset(dirty_data))


if __name__ == "__main__":
    main()