
import java.io.FileReader;
import java.io.IOException;

public class SimpleFileIO {
    public static void main(String[] args) {
        String fileName = "data.txt";

        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            System.out.println("Reading from " + fileName + ":");
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
    }
}