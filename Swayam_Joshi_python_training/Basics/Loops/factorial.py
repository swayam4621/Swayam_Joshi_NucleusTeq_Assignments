# Q14 Find factorial of a number.

def calculate_factorial(num: int) -> int:
    if num < 0:
        raise ValueError("Factorial not defined for negative")
    
    result = 1
    for i in range(1, num + 1):
        result *= i
    return result

if __name__ == "__main__":
    try:
        user_num = int(input("Enter a positive number to find its factorial: "))
        print(f"The factorial of {user_num} is {calculate_factorial(user_num)}")
    except ValueError as e:
        print(f"Error: {e}. Please enter a positive integer.")