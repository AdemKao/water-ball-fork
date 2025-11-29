package com.waterballsa.backend.gym.controller;

import com.waterballsa.backend.gym.dto.*;
import com.waterballsa.backend.gym.service.GymExerciseService;
import com.waterballsa.backend.gym.service.GymSubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class GymExerciseController {

    private final GymExerciseService exerciseService;
    private final GymSubmissionService submissionService;

    @GetMapping("/gyms/{gymId}/exercises")
    public ResponseEntity<GymExerciseListResponse> getExercises(
            @PathVariable Long gymId,
            @RequestAttribute(value = "userId", required = false) UUID userId) {
        log.info("Getting exercises for gym: {}", gymId);
        GymExerciseListResponse response = exerciseService.getExercisesByGym(gymId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exercises/{exerciseId}")
    public ResponseEntity<GymExerciseDetailDto> getExerciseDetail(
            @PathVariable Long exerciseId,
            @RequestAttribute(value = "userId", required = false) UUID userId) {
        log.info("Getting exercise detail: {}", exerciseId);
        GymExerciseDetailDto detail = exerciseService.getExerciseDetail(exerciseId, userId);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/exercises/{exerciseId}/submissions")
    public ResponseEntity<GymSubmissionDto> submitExercise(
            @PathVariable Long exerciseId,
            @RequestParam("file") MultipartFile file,
            @RequestAttribute("userId") UUID userId) {
        log.info("Submitting exercise {} by user {}", exerciseId, userId);
        GymSubmissionDto submission = submissionService.submitExercise(exerciseId, userId, file);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/exercises/{exerciseId}/submissions/me")
    public ResponseEntity<Map<String, List<GymSubmissionDto>>> getMySubmissions(
            @PathVariable Long exerciseId,
            @RequestAttribute("userId") UUID userId) {
        log.info("Getting submissions for exercise {} by user {}", exerciseId, userId);
        List<GymSubmissionDto> submissions = submissionService.getUserSubmissions(exerciseId, userId);
        return ResponseEntity.ok(Map.of("submissions", submissions));
    }
}
