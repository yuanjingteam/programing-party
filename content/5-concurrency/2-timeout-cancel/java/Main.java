import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
  private static CompletableFuture<String> slowTask() {
    return CompletableFuture.supplyAsync(
        () -> {
          try {
            TimeUnit.SECONDS.sleep(3);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("interrupted");
          }
          return "finished";
        });
  }

  public static void main(String[] args) {
    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    CompletableFuture<String> timeout = new CompletableFuture<>();
    scheduler.schedule(() -> timeout.complete("timeout"), 1, TimeUnit.SECONDS);

    CompletableFuture<String> task = slowTask().applyToEither(timeout, (v) -> v);
    scheduler.shutdown();

    System.out.println(task.join());
    System.out.println("timeout=" + Duration.ofSeconds(1));
  }
}
