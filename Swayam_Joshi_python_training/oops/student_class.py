# Q40 Create a Student class with attributes and display details.

class Student:
    def __init__(self, name: str, roll: int):
        self.name = name
        self.roll = roll

    def display(self) -> None:
        print(f"Name: {self.name}, Roll No: {self.roll}")

if __name__ == "__main__":
    try:
        s_name = input("Enter student name: ")
        s_roll = int(input("Enter roll number: "))
        student = Student(s_name, s_roll)
        student.display()
    except ValueError:
        print("Invalid roll number.")