# Q19 Write a function that returns maximum number from a list.

def get_max(numbers: list[float]) -> float:
    return max(numbers)

if __name__ == "__main__":
    try:
        user_input = input("Enter numbers separated by space: ")
        nums = [float(x) for x in user_input.split()]
        print(f"Max number: {get_max(nums)}")
    except ValueError:
        print("Please enter valid numbers.")