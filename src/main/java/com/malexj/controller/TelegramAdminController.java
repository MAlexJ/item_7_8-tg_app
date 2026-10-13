package com.malexj.controller;

import com.malexj.model.TelegramChannelMember;
import com.malexj.model.TelegramSurveyParticipant;
import com.malexj.repository.TelegramChannelMemberRepository;
import com.malexj.repository.TelegramSurveyParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Read-only endpoints backing the admin web UI (two tabs). */
@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class TelegramAdminController {

  private final TelegramChannelMemberRepository channelMemberRepository;
  private final TelegramSurveyParticipantRepository participantRepository;

  @GetMapping("/members")
  public Page<TelegramChannelMember> members(
      @PageableDefault(size = 20, sort = "lastUpdated", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return channelMemberRepository.findAll(pageable);
  }

  @GetMapping("/survey")
  public Page<TelegramSurveyParticipant> survey(
      @PageableDefault(size = 20, sort = "lastUpdated", direction = Sort.Direction.DESC)
          Pageable pageable) {
    return participantRepository.findAll(pageable);
  }

  @DeleteMapping("/survey/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteSurveyParticipant(@PathVariable String id) {
    participantRepository.deleteById(id);
  }
}
