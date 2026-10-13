package com.malexj.configuration;

import jakarta.annotation.PreDestroy;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;

/** Scheduler configuration that runs all @Scheduled tasks on virtual threads */
@Slf4j
@EnableScheduling
@Configuration
public class SchedulerConfiguration {

  /*
   * Best production setup (Spring Boot 4)
   * ✔ One scheduler platform thread
   * ✔ Virtual thread per scheduled task
   * ✔ Fully compliant with Spring Boot Coordinated Shutdown
   * ✔ Minimal resource usage
   * ✔ Maximum parallelism
   * Here is the corrected and recommended configuration:
   *
   * Note on shutdown: ConcurrentTaskScheduler does NOT own executors passed to its constructor
   * (it has no destroy() hook), so Spring never closes them. Both executors are therefore closed
   * explicitly in @PreDestroy below.
   */

  // 1. Virtual thread executor (just Executor)
  private final ExecutorService taskExecutor =
      Executors.newThreadPerTaskExecutor(Thread.ofVirtual().name("scheduler-vt-", 0).factory());

  // 2. Single platform thread — required for scheduling itself
  private final ScheduledExecutorService scheduler =
      Executors.newSingleThreadScheduledExecutor(
          Thread.ofPlatform().name("scheduler-platform-", 0).factory());

  @Bean
  public TaskScheduler taskScheduler() {
    return new ConcurrentTaskScheduler(taskExecutor, scheduler);
  }

  @PreDestroy
  public void shutdown() {
    log.info("Shutting down scheduler executors");
    shutdownQuietly(taskExecutor, "scheduler-vt");
    shutdownQuietly(scheduler, "scheduler-platform");
  }

  private static void shutdownQuietly(ExecutorService executor, String name) {
    executor.shutdown();
    try {
      if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
        log.warn("Forcing shutdown of {} executor...", name);
        executor.shutdownNow();
      }
    } catch (InterruptedException e) {
      log.warn("Interrupted while shutting down {} executor", name, e);
      Thread.currentThread().interrupt();
      executor.shutdownNow();
    }
  }
}
