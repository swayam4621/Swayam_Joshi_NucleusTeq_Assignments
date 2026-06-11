# Q11 Check whether a year is a leap year.

def is_leap_year(year: int) -> bool:
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

if __name__ == "__main__":
    try:
        user_year = int(input("Enter a year to check if it is a leap year "))
        if is_leap_year(user_year):
            print(f"{user_year} is a leap year.")
        else:
            print(f"{user_year} is not a leap year.")
    except ValueError:
        print("Invalid input")