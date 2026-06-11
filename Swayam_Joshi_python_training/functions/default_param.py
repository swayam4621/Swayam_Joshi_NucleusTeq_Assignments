# Q20 Write a function using default parameters.

def greet(name: str = "Guest") -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    user_name = input("Enter name or press Enter to skip ")
    if user_name.strip():
        print(greet(user_name))
    else:
        print(greet())