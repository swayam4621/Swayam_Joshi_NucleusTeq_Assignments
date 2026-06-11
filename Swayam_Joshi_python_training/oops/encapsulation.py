# Q43: Implement encapsulation using private variables in Bank class.

class Bank:
    """Class to show data encapsulation."""
    def __init__(self, balance: float):
        self.__balance = balance  # Private variable

    def get_balance(self) -> float:
        return self.__balance

if __name__ == "__main__":
    try:
        initial = float(input("Enter starting balance: "))
        account = Bank(initial)
        print(f"Secure Balance: {account.get_balance()}")
    except ValueError:
        print("Invalid balance.")