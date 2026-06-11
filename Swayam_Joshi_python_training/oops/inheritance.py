# Q42: Implement inheritance using Person and Employee class.

class Person:
    """Base class for a person."""
    def __init__(self, name: str):
        self.name = name

class Employee(Person):
    """Derived class inheriting from person"""
    def __init__(self, name: str, emp_id: int):
        super().__init__(name)
        self.emp_id = emp_id

    def display(self) -> None:
        print(f"Employee Name: {self.name}, ID: {self.emp_id}")

if __name__ == "__main__":
    try:
        e_name = input("Enter employee name: ")
        e_id = int(input("Enter employee ID: "))
        emp = Employee(e_name, e_id)
        emp.display()
    except ValueError:
        print("Invalid ID.")