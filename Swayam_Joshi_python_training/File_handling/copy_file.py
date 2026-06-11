# Q38 Copy content from one file to another.

def copy_file(source: str, destination: str) -> None:
    try:
        with open(source, 'r') as src, open(destination, 'w') as dest:
            dest.write(src.read())
        print("File copied successfully.")
    except FileNotFoundError:
        print("Source file not found.")

if __name__ == "__main__":
    src_file = input("Enter source filename: ")
    dest_file = input("Enter destination filename: ")
    copy_file(src_file, dest_file)