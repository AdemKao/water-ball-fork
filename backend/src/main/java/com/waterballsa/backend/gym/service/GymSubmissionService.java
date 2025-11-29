package com.waterballsa.backend.gym.service;

import com.waterball.course.entity.User;
import com.waterball.course.repository.UserRepository;
import com.waterballsa.backend.gym.dto.GymSubmissionDto;
import com.waterballsa.backend.gym.dto.GymSubmissionListResponse;
import com.waterballsa.backend.gym.dto.ReviewSubmissionRequest;
import com.waterballsa.backend.gym.domain.GymExercise;
import com.waterballsa.backend.gym.domain.GymSubmission;
import com.waterballsa.backend.gym.domain.SubmissionStatus;
import com.waterballsa.backend.gym.repository.GymExerciseRepository;
import com.waterballsa.backend.gym.repository.GymSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GymSubmissionService {

    private final GymSubmissionRepository submissionRepository;
    private final GymExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public GymSubmissionDto submitExercise(Long exerciseId, UUID userId, MultipartFile file) {
        GymExercise exercise = exerciseRepository.findById(exerciseId)
            .orElseThrow(() -> new RuntimeException("Exercise not found: " + exerciseId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        String fileUrl = fileStorageService.storeFile(file, "submissions/" + exerciseId);

        GymSubmission submission = GymSubmission.builder()
            .exercise(exercise)
            .user(user)
            .fileUrl(fileUrl)
            .fileName(file.getOriginalFilename())
            .fileSize(file.getSize())
            .status(SubmissionStatus.PENDING)
            .build();

        submission = submissionRepository.save(submission);
        log.info("Created submission {} for exercise {} by user {}", submission.getId(), exerciseId, userId);

        return toDto(submission);
    }

    @Transactional
    public GymSubmissionDto reviewSubmission(Long submissionId, UUID reviewerId, ReviewSubmissionRequest request) {
        GymSubmission submission = submissionRepository.findById(submissionId)
            .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("Reviewer not found: " + reviewerId));

        submission.setStatus(SubmissionStatus.valueOf(request.getStatus()));
        submission.setFeedback(request.getFeedback());
        submission.setReviewedBy(reviewer);
        submission.setReviewedAt(LocalDateTime.now());

        submission = submissionRepository.save(submission);
        log.info("Reviewed submission {} with status {}", submissionId, request.getStatus());

        return toDto(submission);
    }

    @Transactional(readOnly = true)
    public GymSubmissionListResponse getPendingSubmissions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GymSubmission> submissionPage = submissionRepository.findByStatus(SubmissionStatus.PENDING, pageable);

        List<GymSubmissionDto> dtos = submissionPage.getContent().stream()
            .map(this::toDto)
            .collect(Collectors.toList());

        return GymSubmissionListResponse.builder()
            .submissions(dtos)
            .totalCount(submissionPage.getTotalElements())
            .page(page)
            .pageSize(size)
            .build();
    }

    @Transactional(readOnly = true)
    public List<GymSubmissionDto> getUserSubmissions(Long exerciseId, UUID userId) {
        return submissionRepository.findUserSubmissionsForExercise(exerciseId, userId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    private GymSubmissionDto toDto(GymSubmission s) {
        return GymSubmissionDto.builder()
            .id(s.getId())
            .exerciseId(s.getExercise().getId())
            .userId(s.getUser().getId())
            .userName(s.getUser().getName())
            .fileUrl(s.getFileUrl())
            .fileName(s.getFileName())
            .fileSize(s.getFileSize())
            .status(s.getStatus().name())
            .feedback(s.getFeedback())
            .reviewedBy(s.getReviewedBy() != null ? s.getReviewedBy().getId() : null)
            .reviewerName(s.getReviewedBy() != null ? s.getReviewedBy().getName() : null)
            .reviewedAt(s.getReviewedAt())
            .submittedAt(s.getSubmittedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}
