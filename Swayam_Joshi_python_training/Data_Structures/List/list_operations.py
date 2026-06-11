# Q25 Create a list of 10 numbers and find sum, max, sort it, and remove duplicates.

def process_list(nums: list[int]) -> None:
    print(f"Sum: {sum(nums)}")
    print(f"Max: {max(nums)}")
    nums.sort()
    print(f"Sorted: {nums}")
    print(f"No duplicates: {list(set(nums))}")

if __name__ == "__main__":
    try:
        user_input = input("Enter 10 numbers (space separated): ")
        numbers = [int(x) for x in user_input.split()]
        process_list(numbers)
    except ValueError:
        print("Please enter valid integers.")