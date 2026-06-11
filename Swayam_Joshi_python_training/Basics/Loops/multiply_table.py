# Q13 Print multiplication table of a number.

def print_table(num: int, rows: int = 10) -> None:
    print(f" Multiplication table for {num} ")
    for i in range(1, rows + 1):
        print(f"{num} x {i} = {num * i}")

if __name__ == "__main__":
    try:
        base_number = int(input("Enter a number"))
        print_table(base_number)
    except ValueError:
        print("Invalid input")