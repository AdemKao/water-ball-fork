package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.gym.*;
import com.waterball.course.entity.*;
import com.waterball.course.exception.AccessDeniedException;
import com.waterball.course.exception.ProblemLockedException;
import com.waterball.course.service.gym.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {
    private final ProblemService problemService;
    private final PrerequisiteService prerequisiteService;
    private final SubmissionService submissionService;
    private final GymAccessControlService gymAccessControlService;

    @GetMapping("/{problemId}")
    public ResponseEntity<ProblemDetailResponse> getProblemDetail(
            @PathVariable UUID problemId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = principal.getUser().getId();
        Problem problem = problemService.getProblem(problemId);
        Stage stage = problem.getStage();
        Gym gym = stage.getGym();
        UUID journeyId = gym.getJourney().getId();
        
        if (!gymAccessControlService.hasPurchasedJourney(userId, journeyId)) {
            throw new AccessDeniedException("Course not purchased");
        }
        
        boolean isUnlocked = gymAccessControlService.isProblemUnlocked(userId, problem);
        if (!isUnlocked) {
            throw new ProblemLockedException("Problem is locked. Complete prerequisites first");
        }
        
        List<ProblemDetailResponse.PrerequisiteInfoResponse> prerequisites = 
                prerequisiteService.getProblemPrerequisiteInfos(problemId, userId).stream()
                        .map(this::toPrerequisiteInfo)
                        .collect(Collectors.toList());
        
        ProblemDetailResponse.SubmissionInfoResponse latestSubmission = 
                problemService.getLatestSubmission(userId, problemId)
                        .map(this::toSubmissionInfo)
                        .orElse(null);
        
        ProblemDetailResponse.ProblemNavResponse previousProblem = 
                problemService.getPreviousProblem(stage.getId(), problem.getSortOrder())
                        .map(p -> new ProblemDetailResponse.ProblemNavResponse(p.getId(), p.getTitle()))
                        .orElse(null);
        
        ProblemDetailResponse.ProblemNavResponse nextProblem = 
                problemService.getNextProblem(stage.getId(), problem.getSortOrder())
                        .map(p -> new ProblemDetailResponse.ProblemNavResponse(p.getId(), p.getTitle()))
                        .orElse(null);
        
        List<ProblemDetailResponse.HintResponse> hints = problem.getHints().stream()
                .map(h -> new ProblemDetailResponse.HintResponse(h.order(), h.content()))
                .collect(Collectors.toList());
        
        ProblemDetailResponse response = new ProblemDetailResponse(
                problem.getId(),
                stage.getId(),
                stage.getTitle(),
                gym.getId(),
                gym.getTitle(),
                problem.getTitle(),
                problem.getDescription(),
                problem.getDifficulty(),
                problem.getSubmissionTypeList(),
                hints,
                problem.getExpReward(),
                isUnlocked,
                prerequisites,
                latestSubmission,
                previousProblem,
                nextProblem
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{problemId}/submissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionResponse> createSubmission(
            @PathVariable UUID problemId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPublic", required = false, defaultValue = "false") boolean isPublic,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = principal.getUser().getId();
        Submission submission = submissionService.createSubmission(userId, problemId, file, isPublic);
        
        SubmissionResponse response = new SubmissionResponse(
                submission.getId(),
                submission.getProblem().getId(),
                submission.getFileUrl(),
                submission.getFileName(),
                submission.getFileType(),
                submission.getStatus(),
                submission.getIsPublic(),
                submission.getVersion(),
                submission.getSubmittedAt()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{problemId}/submissions")
    public ResponseEntity<List<SubmissionHistoryItemResponse>> getSubmissionHistory(
            @PathVariable UUID problemId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        UUID userId = principal.getUser().getId();
        List<Submission> submissions = submissionService.getSubmissionHistory(userId, problemId);
        
        List<SubmissionHistoryItemResponse> response = submissions.stream()
                .map(this::toSubmissionHistoryItem)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    private ProblemDetailResponse.SubmissionInfoResponse toSubmissionInfo(Submission submission) {
        ProblemDetailResponse.ReviewInfoResponse reviewInfo = submissionService.getReview(submission.getId())
                .map(r -> new ProblemDetailResponse.ReviewInfoResponse(
                        r.getId(),
                        r.getContent(),
                        r.getStatus(),
                        r.getReviewedAt(),
                        r.getReviewer().getName()
                ))
                .orElse(null);
        
        return new ProblemDetailResponse.SubmissionInfoResponse(
                submission.getId(),
                submission.getStatus(),
                submission.getFileUrl(),
                submission.getFileName(),
                submission.getSubmittedAt(),
                submission.getVersion(),
                reviewInfo
        );
    }

    private SubmissionHistoryItemResponse toSubmissionHistoryItem(Submission submission) {
        SubmissionHistoryItemResponse.ReviewInfoResponse reviewInfo = submissionService.getReview(submission.getId())
                .map(r -> new SubmissionHistoryItemResponse.ReviewInfoResponse(
                        r.getId(),
                        r.getContent(),
                        r.getStatus(),
                        r.getReviewedAt(),
                        r.getReviewer().getName()
                ))
                .orElse(null);
        
        return new SubmissionHistoryItemResponse(
                submission.getId(),
                submission.getFileUrl(),
                submission.getFileName(),
                submission.getFileType(),
                submission.getFileSizeBytes() != null ? submission.getFileSizeBytes() : 0L,
                submission.getStatus(),
                submission.getIsPublic(),
                submission.getVersion(),
                submission.getSubmittedAt(),
                reviewInfo
        );
    }

    private ProblemDetailResponse.PrerequisiteInfoResponse toPrerequisiteInfo(PrerequisiteService.PrerequisiteInfo info) {
        return new ProblemDetailResponse.PrerequisiteInfoResponse(
                info.type(),
                info.id(),
                info.title(),
                info.isCompleted()
        );
    }
}
