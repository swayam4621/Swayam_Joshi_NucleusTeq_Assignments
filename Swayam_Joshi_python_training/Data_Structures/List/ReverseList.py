# Q27 Reverse a list without using reverse().

def custom_reverse(nums: list[int]) -> list[int]:
    return nums[::-1]

if __name__ == "__main__":
    try:
        user_input = input("Enter numbers (space separated): ")
        numbers = [int(x) for x in user_input.split()]
        print(f"Reversed: {custom_reverse(numbers)}")
    except ValueError:
        print("Invalid input.")