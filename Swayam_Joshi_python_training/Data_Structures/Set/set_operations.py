# Q30 Perform union, intersection, and difference on two sets.

def set_operations() -> None:
    set1 = {1, 2, 3, 4}
    set2 = {3, 4, 5, 6}
    
    print(f"Set 1: {set1} | Set 2: {set2}")
    print(f"Union: {set1 | set2}")
    print(f"Intersection: {set1 & set2}")
    print(f"Difference (S1 - S2): {set1 - set2}")

if __name__ == "__main__":
    set_operations()