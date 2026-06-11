# Q35 Create a file and write your name into it.

def write_name(filename: str, name: str) -> None:
    with open(filename, 'w') as f:
        f.write(f"{name}\n")

if __name__ == "__main__":
    user_name = input("Enter your name: ")
    write_name("data.txt", user_name)
    print("Name written to data.txt")