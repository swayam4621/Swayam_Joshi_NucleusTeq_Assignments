# Q22 Use math module to find square root, power, and factorial.

import math

def use_math(num: int) -> None:
    print(f"Square root: {math.sqrt(num)}")
    print(f"Power (num^2): {math.pow(num, 2)}")
    print(f"Factorial: {math.factorial(num)}")

if __name__ == "__main__":
    try:
        val = int(input("Enter a positive integer: "))
        use_math(val)
    except ValueError:
        print("Invalid input.")