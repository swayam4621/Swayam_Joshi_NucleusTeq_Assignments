# Q39 Search a word in a file.

def search_word(filename: str, word: str) -> bool:
    try:
        with open(filename, 'r') as f:
            return word in f.read()
    except FileNotFoundError:
        print("File not found.")
        return False

if __name__ == "__main__":
    target = input("Enter word to search: ")
    found = search_word("data.txt", target)
    print(f"Word found: {found}")