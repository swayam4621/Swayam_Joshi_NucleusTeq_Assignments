# Q44 Demonstrate polymorphism using different classes with the same method name.

class Dog:
    def speak(self) -> str:
        return "Woof!"

class Cat:
    def speak(self) -> str:
        return "Meow!"

def animal_sound(animal: Dog | Cat) -> None:
    """Function demonstrating polymorphism """
    print(animal.speak())

if __name__ == "__main__":
    print("Dog says:", end=" ")
    animal_sound(Dog())
    
    print("Cat says:", end=" ")
    animal_sound(Cat())