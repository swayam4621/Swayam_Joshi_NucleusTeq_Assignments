# Q34 Merge two dictionaries.

def merge_dicts(d1: dict[str, int], d2: dict[str, int]) -> dict[str, int]:
    return {**d1, **d2}

if __name__ == "__main__":
    dict1 = {"a": 1, "b": 2}
    dict2 = {"c": 3, "d": 4}
    print(f"Merged: {merge_dicts(dict1, dict2)}")