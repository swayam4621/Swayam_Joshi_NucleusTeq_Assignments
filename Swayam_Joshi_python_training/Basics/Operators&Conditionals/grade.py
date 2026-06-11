# Question 10: Calculate grade based on marks (A/B/C/Fail).

def calculate_grade(marks: float) -> str:
    if marks < 0 or marks > 100:
        return "Invalid marks"
    if marks >= 90:
        return "A"
    if marks >= 80:
        return "B"
    if marks >= 70:
        return "C"
    return "Fail"

if __name__ == "__main__":
    try:
        user_marks = float(input("Enter marks (0-100): "))
        grade = calculate_grade(user_marks)
        print(f"Calculated Grade: {grade}")
    except ValueError:
        print("Invalid input")