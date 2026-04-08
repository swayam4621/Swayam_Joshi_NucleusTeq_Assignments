import java.util.Scanner;
public class areaCalculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Select Shape:\n 1. Circle \n 2. Rectangle \n 3. Triangle \n");
        int choice = sc.nextInt();

        switch (choice) {
            case 1 -> {
                System.out.print("Enter radius: ");
                double r = sc.nextDouble();
                System.out.println("Area: " + (Math.PI * r * r));
            }
            case 2 -> {
                System.out.print("Enter length and breadth: ");
                double l = sc.nextDouble(); 
                double b = sc.nextDouble();
                System.out.println("Area: " + (l * b));
            }
            case 3 -> {
                System.out.print("Enter base and height: ");
                double b = sc.nextDouble();
                double h = sc.nextDouble();
                System.out.println("Area: " + (0.5 * b * h));
            }
            default -> System.out.println("Invalid Choice");
        }
        sc.close();
    }
}