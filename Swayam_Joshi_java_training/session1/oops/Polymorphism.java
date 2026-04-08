//parent Class
class Shape {
    String type;

    public Shape() {
        this.type = "Generic Shape";
    }

    //method with no parameters 
    public void draw() {
        System.out.println("Drawing a " + type);
    }
}

//child Class
class Circle extends Shape {
    public Circle() {
        this.type = "Circle";
    }

    //1. METHOD OVERRIDING
     
    @Override
    public void draw() {
        System.out.println("Drawing a Circle using coordinates (0,0).");
    }

    
    //2. METHOD OVERLOADING 
    public void draw(String color) {
        System.out.println("Drawing a " + color + " Circle.");
    }

    public void draw(int radius) {
        System.out.println("Drawing a Circle with radius: " + radius + " units.");
    }
}

public class Polymorphism {
    public static void main(String[] args) {
        Circle myCircle = new Circle();

        // the overridden method 
        myCircle.draw(); 

        //calls the overloaded method with string as argument
        myCircle.draw("Red");

        //calls the overloaded method with string as argument
        myCircle.draw(15);
    }
}