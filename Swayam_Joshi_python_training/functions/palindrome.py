# Q18: Write a function to check palindrome(Number and string).

def is_palindrome(data: str) -> bool:
    return data == data[::-1]

if __name__ == "__main__":
    val = input("Enter text or number: ")
    print("Palindrome" if is_palindrome(val) else "Not a palindrome")