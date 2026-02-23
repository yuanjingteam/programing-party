import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class Main {
  private static CompletableFuture<String> slowTask(String name, int delayMs) {
    return CompletableFuture.supplyAsync(
        () -> {
          try {
            Thread.sleep(delayMs);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("interrupted");
          }
          return name + " done";
        });
  }

  public static void main(String[] args) throws ExecutionException, InterruptedException {
    Instant start = Instant.now();

    CompletableFuture<String> a = slowTask("A", 600);
    CompletableFuture<String> b = slowTask("B", 900);

    CompletableFuture<Void> all = CompletableFuture.allOf(a, b);
    all.get();

    System.out.println(a.get());
    System.out.println(b.get());
    System.out.println("elapsed=" + Duration.between(start, Instant.now()).toMillis() + "ms");
  }
}

