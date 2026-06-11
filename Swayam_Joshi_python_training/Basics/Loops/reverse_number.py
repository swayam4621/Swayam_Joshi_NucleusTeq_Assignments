# Q15 Reverse a number using loop.

def reverse_integer(num: int) -> int:
    is_negative = num < 0
    num = abs(num)
    reversed_num = 0
    
    while num > 0:
        reversed_num = (reversed_num * 10) + (num % 10)
        num //= 10
        
    return -reversed_num if is_negative else reversed_num

if __name__ == "__main__":
    try:
        user_num = int(input("Enter a number: "))
        print(f"Reversed number: {reverse_integer(user_num)}")
    except ValueError:
        print("Invalid input")