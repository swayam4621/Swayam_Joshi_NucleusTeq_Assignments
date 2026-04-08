class MyTask extends Thread {
    private String taskName;

    public MyTask(String name) {
        this.taskName = name;
    }

    @Override
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(taskName + " is executing step " + i);
            try {
                Thread.sleep(500); 
            } catch (InterruptedException e) {
                System.out.println(e.getMessage());
            }
        }
    }
}

public class MultiThreading {
    public static void main(String[] args) {
        MyTask t1 = new MyTask("Thread A");
        MyTask t2 = new MyTask("Thread B");

        // start() begins the concurrent execution
        t1.start();
        t2.start();
    }
}