import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Main {
  public static void main(String[] args) {
    Path path = Paths.get("missing.txt");

    try {
      String content = new String(Files.readAllBytes(path), "UTF-8");
      System.out.println(content);
    } catch (Exception e) {
      System.out.println("read failed: " + e.getClass().getSimpleName());
      System.out.println("message: " + e.getMessage());
    }
  }
}
