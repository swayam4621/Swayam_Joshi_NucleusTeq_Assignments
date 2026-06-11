# Take two numbers and print sum, difference, multiplication, and division.
def calculate(a: float, b: float) -> dict[str, float | str]:
    return {
        "sum": a + b,
        "difference": a - b,
        "multiplication": a * b,
        "division": a / b if b != 0 else "Undefined (Division by zero)"
    }

if __name__ == "__main__":
    results = calculate(15.0, 5.0)
    for op, res in results.items():
        print(f"{op.capitalize()}: {res}")