# Q32 Create a student dictionary and access values.

def student_info() -> None:
    student = {"name": "John", "age": 20, "course": "Engineering"}
    print(f"Student Data: {student}")
    print(f"Course: {student.get('course')}")

if __name__ == "__main__":
    student_info()