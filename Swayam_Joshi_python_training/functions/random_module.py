# Q23 Generate random numbers using random module.

import random

def generate_random() -> int:
    return random.randint(1, 100)

if __name__ == "__main__":
    print(f"Generated random number: {generate_random()}")