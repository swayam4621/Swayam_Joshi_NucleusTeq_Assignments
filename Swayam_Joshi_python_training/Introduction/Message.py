
def format_greeting(name: str, age: int) -> str:
    return f"Hello {name}, you are {age} years old."

if __name__ == "__main__":
    user_name = input("Enter your name: ")
    user_age = int(input("Enter your age: "))
    print(format_greeting(user_name, user_age))