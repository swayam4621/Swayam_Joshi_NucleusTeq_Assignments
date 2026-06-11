# Q8 Check whether a number is positive, negative, or zero.

def check_sign(num: float) -> str:
    if num > 0:
        return "Positive"
    if num < 0:
        return "Negative"
    return "Zero"

if __name__ == "__main__":
    try:
        user_input = float(input("Enter a number: "))
        print(f"The number {user_input} is {check_sign(user_input)}.")
    except ValueError:
        print("Invalid input")