# Q36 Read a file and count words, lines, and characters.

def get_file_stats(filename: str) -> None:
    try:
        with open(filename, 'r') as f:
            lines = f.readlines()
            words = sum(len(line.split()) for line in lines)
            chars = sum(len(line) for line in lines)
            print(f"Lines: {len(lines)}, Words: {words}, Chars: {chars}")
    except FileNotFoundError:
        print("File does not exist.")

if __name__ == "__main__":
    file_name = input("Enter filename (e.g., data.txt): ")
    get_file_stats(file_name)