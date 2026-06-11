# Q41 Create a Car class with a constructor.

class Car:
    def __init__(self, brand: str, model: str):
        self.brand = brand
        self.model = model

    def display(self) -> None:
        print(f"Car: {self.brand} {self.model}")

if __name__ == "__main__":
    c_brand = input("Enter car brand: ")
    c_model = input("Enter car model: ")
    car = Car(c_brand, c_model)
    car.display()