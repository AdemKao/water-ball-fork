package com.waterballsa.backend.gym.service;

import com.waterballsa.backend.gym.domain.GymExercise;
import com.waterballsa.backend.gym.domain.GymSubmission;
import com.waterballsa.backend.gym.dto.*;
import com.waterballsa.backend.gym.repository.GymExerciseRepository;
import com.waterballsa.backend.gym.repository.GymSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GymExerciseService {

    private final GymExerciseRepository gymExerciseRepository;
    private final GymSubmissionRepository gymSubmissionRepository;

    public GymExerciseListResponse getExercisesByGym(Long gymId, UUID userId) {
        List<GymExercise> exercises = gymExerciseRepository.findByGymIdOrderByDisplayOrderAsc(gymId);
        List<GymExerciseDto> dtos = exercises.stream()
            .map(ex -> toDto(ex, userId))
            .collect(Collectors.toList());
        return GymExerciseListResponse.builder().exercises(dtos).build();
    }

    public GymExerciseDetailDto getExerciseDetail(Long exerciseId, UUID userId) {
        GymExercise exercise = gymExerciseRepository.findByIdWithSubmissions(exerciseId)
            .orElseThrow(() -> new RuntimeException("Exercise not found: " + exerciseId));

        List<GymSubmission> userSubmissions = userId != null ?
            gymSubmissionRepository.findUserSubmissionsForExercise(exerciseId, userId) :
            List.of();

        return toDetailDto(exercise, userSubmissions);
    }

    private GymExerciseDto toDto(GymExercise exercise, UUID userId) {
        Optional<GymSubmission> latestSubmission = userId != null ?
            gymSubmissionRepository.findTopByExerciseIdAndUserIdOrderBySubmittedAtDesc(exercise.getId(), userId) :
            Optional.empty();

        return GymExerciseDto.builder()
            .id(exercise.getId())
            .gymId(exercise.getGym().getId())
            .title(exercise.getTitle())
            .description(exercise.getDescription())
            .difficulty(exercise.getDifficulty().name())
            .displayOrder(exercise.getDisplayOrder())
            .hasSubmission(latestSubmission.isPresent())
            .latestSubmissionStatus(latestSubmission.map(s -> s.getStatus().name()).orElse(null))
            .createdAt(exercise.getCreatedAt())
            .updatedAt(exercise.getUpdatedAt())
            .build();
    }

    private GymExerciseDetailDto toDetailDto(GymExercise exercise, List<GymSubmission> submissions) {
        List<GymSubmissionDto> submissionDtos = submissions.stream()
            .map(this::toSubmissionDto)
            .collect(Collectors.toList());

        return GymExerciseDetailDto.builder()
            .id(exercise.getId())
            .gymId(exercise.getGym().getId())
            .title(exercise.getTitle())
            .description(exercise.getDescription())
            .difficulty(exercise.getDifficulty().name())
            .displayOrder(exercise.getDisplayOrder())
            .submissions(submissionDtos)
            .createdAt(exercise.getCreatedAt())
            .updatedAt(exercise.getUpdatedAt())
            .build();
    }

    private GymSubmissionDto toSubmissionDto(GymSubmission s) {
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
