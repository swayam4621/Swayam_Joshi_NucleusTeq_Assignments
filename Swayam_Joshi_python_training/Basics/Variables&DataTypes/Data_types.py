# q4_Create variables of type int, float, string, and boolean. Print their types using type().
def display_types() -> None:
    v_int: int = 10
    v_float: float = 10.5
    v_str: str = "Swayam"
    v_bool: bool = True

    for var in (v_int, v_float, v_str, v_bool):
        print(f"Value: {var}, Type: {type(var)}")

if __name__ == "__main__":
    display_types()