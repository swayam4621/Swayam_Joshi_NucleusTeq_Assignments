# Q26 Count even and odd numbers in a list.

def count_even_odd(nums: list[int]) -> tuple[int, int]:
    evens = sum(1 for n in nums if n % 2 == 0)
    return evens, len(nums) - evens

if __name__ == "__main__":
    try:
        user_input = input("Enter numbers (space separated): ")
        numbers = [int(x) for x in user_input.split()]
        e, o = count_even_odd(numbers)
        print(f"Evens: {e}, Odds: {o}")
    except ValueError:
        print("Please enter valid integers.")