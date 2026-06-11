# Q31 Remove duplicates from list using set.

def remove_dupes(nums: list[int]) -> list[int]:
    return list(set(nums))

if __name__ == "__main__":
    try:
        user_input = input("Enter numbers with duplicates (space separated): ")
        numbers = [int(x) for x in user_input.split()]
        print(f"Unique: {remove_dupes(numbers)}")
    except ValueError:
        print("Invalid input.")