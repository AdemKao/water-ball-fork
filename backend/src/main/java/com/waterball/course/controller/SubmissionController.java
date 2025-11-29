package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.gym.*;
import com.waterball.course.entity.Review;
import com.waterball.course.entity.Submission;
import com.waterball.course.exception.AccessDeniedException;
import com.waterball.course.service.gym.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @GetMapping("/api/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionDetail(
            @PathVariable UUID submissionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = principal.getUser().getId();
        Submission submission = submissionService.getSubmission(submissionId);
        
        if (!submissionService.canAccessSubmission(userId, submission)) {
            throw new AccessDeniedException("Not authorized to view this submission");
        }
        
        SubmissionDetailResponse.ReviewInfoResponse reviewInfo = submissionService.getReview(submissionId)
                .map(r -> new SubmissionDetailResponse.ReviewInfoResponse(
                        r.getId(),
                        r.getContent(),
                        r.getStatus(),
                        r.getReviewedAt(),
                        r.getReviewer().getName()
                ))
                .orElse(null);
        
        SubmissionDetailResponse response = new SubmissionDetailResponse(
                submission.getId(),
                submission.getProblem().getId(),
                submission.getProblem().getTitle(),
                submission.getProblem().getStage().getTitle(),
                submission.getProblem().getStage().getGym().getTitle(),
                submission.getFileUrl(),
                submission.getFileName(),
                submission.getFileType(),
                submission.getFileSizeBytes(),
                submission.getStatus(),
                submission.getIsPublic(),
                submission.getVersion(),
                submission.getSubmittedAt(),
                reviewInfo
        );
        
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/submissions/{submissionId}/visibility")
    public ResponseEntity<VisibilityUpdateResponse> updateVisibility(
            @PathVariable UUID submissionId,
            @RequestBody VisibilityUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = principal.getUser().getId();
        Submission submission = submissionService.updateVisibility(userId, submissionId, request.isPublic());
        
        VisibilityUpdateResponse response = new VisibilityUpdateResponse(
                submission.getId(),
                submission.getIsPublic(),
                submission.getUpdatedAt()
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/submissions/public/{submissionId}")
    public ResponseEntity<PublicSubmissionResponse> getPublicSubmissionDetail(
            @PathVariable UUID submissionId) {
        Submission submission = submissionService.getSubmission(submissionId);
        
        if (!submission.getIsPublic()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        return ResponseEntity.ok(toPublicSubmission(submission));
    }

    @GetMapping("/api/submissions/public")
    public ResponseEntity<Map<String, Object>> getPublicSubmissions(
            @RequestParam(required = false) UUID problemId,
            @RequestParam(required = false) UUID gymId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Submission> submissionsPage = submissionService.getPublicSubmissions(problemId, gymId, pageable);
        
        List<PublicSubmissionResponse> content = submissionsPage.getContent().stream()
                .map(this::toPublicSubmission)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("totalElements", submissionsPage.getTotalElements());
        response.put("totalPages", submissionsPage.getTotalPages());
        response.put("number", submissionsPage.getNumber());
        response.put("size", submissionsPage.getSize());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/my/gym-progress")
    public ResponseEntity<GymProgressResponse> getGymProgress(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = principal.getUser().getId();
        GymProgressResponse response = submissionService.getUserProgress(userId);
        
        return ResponseEntity.ok(response);
    }

    private PublicSubmissionResponse toPublicSubmission(Submission submission) {
        PublicSubmissionResponse.ReviewInfoResponse reviewInfo = submissionService.getReview(submission.getId())
                .map(r -> new PublicSubmissionResponse.ReviewInfoResponse(
                        r.getContent(),
                        r.getStatus(),
                        r.getReviewedAt(),
                        r.getReviewer().getName()
                ))
                .orElse(null);
        
        return new PublicSubmissionResponse(
                submission.getId(),
                submission.getUser().getName(),
                submission.getUser().getPictureUrl(),
                submission.getProblem().getId(),
                submission.getProblem().getTitle(),
                submission.getProblem().getStage().getGym().getTitle(),
                submission.getFileUrl(),
                submission.getFileName(),
                submission.getStatus(),
                submission.getSubmittedAt(),
                reviewInfo
        );
    }
}
