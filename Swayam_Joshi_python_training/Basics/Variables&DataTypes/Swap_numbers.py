# Write a program to swap two numbers
def swap(a: int, b: int) -> tuple[int, int]:
    a, b = b, a
    return a, b

if __name__ == "__main__":
    x, y = 5, 10
    x, y = swap(x, y)
    print(f"Swapped: x={x}, y={y}")