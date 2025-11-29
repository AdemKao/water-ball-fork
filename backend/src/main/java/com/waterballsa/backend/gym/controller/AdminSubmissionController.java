package com.waterballsa.backend.gym.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterballsa.backend.gym.dto.GymSubmissionDto;
import com.waterballsa.backend.gym.dto.GymSubmissionListResponse;
import com.waterballsa.backend.gym.dto.ReviewSubmissionRequest;
import com.waterballsa.backend.gym.service.FileStorageService;
import com.waterballsa.backend.gym.service.GymSubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminSubmissionController {

    private final GymSubmissionService submissionService;
    private final FileStorageService fileStorageService;

    @GetMapping("/submissions/pending")
    public ResponseEntity<GymSubmissionListResponse> getPendingSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting pending submissions, page: {}, size: {}", page, size);
        GymSubmissionListResponse response = submissionService.getPendingSubmissions(page, size);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/submissions/{submissionId}/review")
    public ResponseEntity<GymSubmissionDto> reviewSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody ReviewSubmissionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("Reviewing submission {} with status {}", submissionId, request.getStatus());
        GymSubmissionDto submission = submissionService.reviewSubmission(
                submissionId, principal.getUser().getId(), request);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/submissions/{submissionId}/download")
    public ResponseEntity<Resource> downloadSubmission(@PathVariable Long submissionId) {
        log.info("Downloading submission: {}", submissionId);
        Resource resource = fileStorageService.loadFileAsResource("submissions/" + submissionId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
