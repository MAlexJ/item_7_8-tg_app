package com.malexj.movie;

import com.malexj.movie.dto.MovieDto;
import com.malexj.telegram.TelegramPublisher;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Cron scheduler that posts one random movie to the Telegram channel every minute. */
@Slf4j
@Component
@RequiredArgsConstructor
public class MoviePostScheduler {

  private final MovieApiClient movieApiClient;
  private final TelegramPublisher publisher;

  @Scheduled(
      cron = "${telegram.post.cron:0 * * * * *}",
      zone = "${telegram.post.timezone:UTC}")
  public void postRandomMovie() {
    List<MovieDto> movies = movieApiClient.fetchMovies();
    if (movies.isEmpty()) {
      log.warn("No movies available, skipping this posting round");
      return;
    }

    MovieDto random = movies.get(ThreadLocalRandom.current().nextInt(movies.size()));
    publisher.sendMovie(random);
  }
}
