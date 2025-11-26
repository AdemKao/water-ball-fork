package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.response.JourneyDetailResponse;
import com.waterball.course.dto.response.JourneyListResponse;
import com.waterball.course.dto.response.JourneyProgressResponse;
import com.waterball.course.service.course.JourneyService;
import com.waterball.course.service.course.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/journeys")
@RequiredArgsConstructor
public class JourneyController {
    private final JourneyService journeyService;
    private final LessonProgressService lessonProgressService;

    @GetMapping
    public ResponseEntity<List<JourneyListResponse>> getJourneys() {
        return ResponseEntity.ok(journeyService.getPublishedJourneys());
    }

    @GetMapping("/{journeyId}")
    public ResponseEntity<JourneyDetailResponse> getJourneyDetail(
            @PathVariable UUID journeyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getUser().getId() : null;
        return ResponseEntity.ok(journeyService.getJourneyDetail(journeyId, userId));
    }

    @GetMapping("/{journeyId}/progress")
    public ResponseEntity<JourneyProgressResponse> getJourneyProgress(
            @PathVariable UUID journeyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                lessonProgressService.getJourneyProgress(journeyId, principal.getUser().getId()));
    }
}
