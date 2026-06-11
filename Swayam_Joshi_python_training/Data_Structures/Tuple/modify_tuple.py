# Q29 Convert tuple into list and modify it.

def modify_tuple(tup: tuple[int, ...], new_val: int) -> tuple[int, ...]:
    temp_list = list(tup)
    temp_list.append(new_val)
    return tuple(temp_list)

if __name__ == "__main__":
    try:
        val = int(input("Enter a number to add to tuple: "))
        my_tup = (1, 2, 3)
        print(f"New tuple: {modify_tuple(my_tup, val)}")
    except ValueError:
        print("Invalid input.")