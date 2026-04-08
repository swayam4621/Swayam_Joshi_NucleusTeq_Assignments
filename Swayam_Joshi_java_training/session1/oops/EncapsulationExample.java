class BankAccount {
    private double balance;
    private String accountNumber;

    public BankAccount(String accountNumber, double initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Successfully deposited: " + amount);
        } else {
            System.out.println("Invalid deposit amount.");
        }
    }

    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("Successfully withdrew: " + amount);
        } else {
            System.out.println("Insufficient balance");
        }
    }
}

public class EncapsulationExample {
    public static void main(String[] args) {
       
        BankAccount myAccount = new BankAccount("Swayam Joshi", 5000.0);

        System.out.println("Account created for: Swayam Joshi");
        System.out.println("Initial Balance: ₹" + myAccount.getBalance());

        myAccount.deposit(1500.0);
        myAccount.withdraw(2000.0); 

        System.out.println("\nAttempting an invalid deposit...");
        myAccount.deposit(-500.0);

        System.out.println("\nFinal Balance: ₹" + myAccount.getBalance());
    }
}