# Q37 Append data to existing file.

def append_data(filename: str, data: str) -> None:
    with open(filename, 'a') as f:
        f.write(f"{data}\n")

if __name__ == "__main__":
    new_data = input("Enter text to append: ")
    append_data("data.txt", new_data)
    print("Data appended to data.txt")