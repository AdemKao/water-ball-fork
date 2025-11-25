package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.request.UpdateProgressRequest;
import com.waterball.course.dto.response.CompleteResponse;
import com.waterball.course.dto.response.LessonDetailResponse;
import com.waterball.course.dto.response.UpdateProgressResponse;
import com.waterball.course.service.course.LessonProgressService;
import com.waterball.course.service.course.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {
    private final LessonService lessonService;
    private final LessonProgressService lessonProgressService;

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonDetailResponse> getLessonDetail(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                lessonService.getLessonDetail(lessonId, principal.getUser().getId()));
    }

    @PutMapping("/{lessonId}/progress")
    public ResponseEntity<UpdateProgressResponse> updateProgress(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProgressRequest request) {
        return ResponseEntity.ok(
                lessonProgressService.updateProgress(
                        lessonId, 
                        principal.getUser().getId(), 
                        request.getLastPositionSeconds()));
    }

    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<CompleteResponse> completeLesson(
            @PathVariable UUID lessonId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                lessonProgressService.completeLesson(lessonId, principal.getUser().getId()));
    }
}
