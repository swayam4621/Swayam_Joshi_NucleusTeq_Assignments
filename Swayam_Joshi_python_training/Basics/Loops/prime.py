# Q16 Check whether a number is prime.

def is_prime(num: int) -> bool:
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

if __name__ == "__main__":
    try:
        user_num = int(input("Enter a number "))
        if is_prime(user_num):
            print(f"{user_num} is a prime number.")
        else:
            print(f"{user_num} is not a prime number.")
    except ValueError:
        print("Invalid input")