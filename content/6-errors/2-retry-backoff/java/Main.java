import java.util.concurrent.TimeUnit;

public class Main {
  private static int attempts = 0;

  private static String unstableOperation() {
    attempts += 1;
    if (attempts < 3) {
      throw new RuntimeException("temporary failure");
    }
    return "ok";
  }

  public static void main(String[] args) throws InterruptedException {
    int maxAttempts = 5;
    long backoffMs = 200;

    for (int i = 1; i <= maxAttempts; i++) {
      try {
        String result = unstableOperation();
        System.out.println("success: " + result);
        return;
      } catch (RuntimeException e) {
        System.out.println("attempt " + i + " failed: " + e.getMessage());
        if (i == maxAttempts) {
          System.out.println("giving up");
          return;
        }
        TimeUnit.MILLISECONDS.sleep(backoffMs);
        backoffMs *= 2;
      }
    }
  }
}

