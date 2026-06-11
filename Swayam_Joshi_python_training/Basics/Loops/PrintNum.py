# Q12 Print numbers from 1 to 100 using loop.

def print_numbers(limit: int = 100) -> None:
    for i in range(1, limit + 1):
        print(i, end=" " if i < limit else "\n")

if __name__ == "__main__":
    user_ready = input("Press Enter to print numbers from 1 to 100, or type custom for a limit: ")
    
    if user_ready.lower() == 'custom':
        try:
            custom_limit = int(input("Enter your custom upper limit: "))
            print_numbers(custom_limit)
        except ValueError:
            print("Invalid input")
    else:
        print_numbers()