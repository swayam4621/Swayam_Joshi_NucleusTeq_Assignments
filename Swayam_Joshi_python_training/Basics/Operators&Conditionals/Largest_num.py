# Q9 Find the largest of three numbers.

def find_largest(a: float, b: float, c: float) -> float:
    return max(a, b, c)

if __name__ == "__main__":
    try:
        print("--- Find the largest number")
        num1 = float(input("Enter the first number: "))
        num2 = float(input("Enter the second number: "))
        num3 = float(input("Enter the third number: "))
        
        largest = find_largest(num1, num2, num3)
        print(f"The largest number is: {largest}")
    except ValueError:
        print("Invalid input")