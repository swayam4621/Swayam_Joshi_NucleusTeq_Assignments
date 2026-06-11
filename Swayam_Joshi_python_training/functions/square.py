# Q17 Write a function to calculate square of a number.

def calculate_square(num: float) -> float:
    return num ** 2

if __name__ == "__main__":
    try:
        val = float(input("Enter a number: "))
        print(f"Square: {calculate_square(val)}")
    except ValueError:
        print("Invalid input.")