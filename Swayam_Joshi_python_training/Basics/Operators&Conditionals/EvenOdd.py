# Q7 Write a program to check whether a number is even or odd.

def is_even(num: int) -> bool:
    return num % 2 == 0

if __name__ == "__main__":
    try:
        user_input = int(input("Enter a number: "))
        result = "Even" if is_even(user_input) else "Odd"
        print(f"The number {user_input} is {result}.")
    except ValueError:
        print("Invalid input")