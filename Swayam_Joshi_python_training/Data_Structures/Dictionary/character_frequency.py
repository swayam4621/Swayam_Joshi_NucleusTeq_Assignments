# Q33 Count frequency of characters in a string using dictionary.

def char_frequency(text: str) -> dict[str, int]:
    return {char: text.count(char) for char in set(text)}

if __name__ == "__main__":
    user_text = input("Enter a string: ")
    print(f"Frequencies: {char_frequency(user_text)}")