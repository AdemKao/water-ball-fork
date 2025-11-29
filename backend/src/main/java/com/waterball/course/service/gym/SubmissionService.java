package com.waterball.course.service.gym;

import com.waterball.course.dto.gym.GymProgressResponse;
import com.waterball.course.entity.*;
import com.waterball.course.exception.*;
import com.waterball.course.repository.GymRepository;
import com.waterball.course.repository.ProblemRepository;
import com.waterball.course.repository.ReviewRepository;
import com.waterball.course.repository.SubmissionRepository;
import com.waterball.course.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubmissionService {
    private static final long PDF_MAX_SIZE = 50L * 1024 * 1024;      // 50MB
    private static final long MP4_MAX_SIZE = 500L * 1024 * 1024;     // 500MB
    private static final long CODE_MAX_SIZE = 10L * 1024 * 1024;     // 10MB
    private static final long IMAGE_MAX_SIZE = 10L * 1024 * 1024;    // 10MB

    private final SubmissionRepository submissionRepository;
    private final ReviewRepository reviewRepository;
    private final ProblemService problemService;
    private final GymAccessControlService gymAccessControlService;
    private final StorageService storageService;
    private final GymRepository gymRepository;
    private final ProblemRepository problemRepository;

    @Transactional(readOnly = true)
    public Submission getSubmission(UUID submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException("Submission not found: " + submissionId));
    }

    @Transactional(readOnly = true)
    public List<Submission> getSubmissionHistory(UUID userId, UUID problemId) {
        return submissionRepository.findByUserIdAndProblemIdOrderByVersionDesc(userId, problemId);
    }

    @Transactional(readOnly = true)
    public Optional<Review> getReview(UUID submissionId) {
        return reviewRepository.findBySubmissionId(submissionId);
    }

    @Transactional(readOnly = true)
    public Page<Submission> getPublicSubmissions(UUID problemId, UUID gymId, Pageable pageable) {
        if (problemId != null) {
            return submissionRepository.findPublicByProblemId(problemId, pageable);
        }
        if (gymId != null) {
            return submissionRepository.findPublicByGymId(gymId, pageable);
        }
        return submissionRepository.findByIsPublicTrueOrderBySubmittedAtDesc(pageable);
    }

    @Transactional
    public Submission createSubmission(UUID userId, UUID problemId, MultipartFile file, boolean isPublic) {
        Problem problem = problemService.getProblem(problemId);
        
        UUID journeyId = problem.getStage().getGym().getJourney().getId();
        if (!gymAccessControlService.hasPurchasedJourney(userId, journeyId)) {
            throw new AccessDeniedException("Course not purchased");
        }
        
        if (!gymAccessControlService.isProblemUnlocked(userId, problem)) {
            throw new ProblemLockedException("Problem is locked. Complete prerequisites first");
        }
        
        SubmissionType fileType = validateAndGetFileType(file, problem);
        validateFileSize(file, fileType);
        
        String fileKey = generateFileKey(userId, problemId, file.getOriginalFilename());
        String fileUrl = storageService.uploadFile(fileKey, file);
        
        int nextVersion = submissionRepository.findMaxVersionByUserIdAndProblemId(userId, problemId)
                .map(v -> v + 1)
                .orElse(1);
        
        User user = new User();
        user.setId(userId);
        
        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setFileUrl(fileUrl);
        submission.setFileType(fileType);
        submission.setFileName(file.getOriginalFilename());
        submission.setFileSizeBytes(file.getSize());
        submission.setStatus(SubmissionStatus.PENDING);
        submission.setIsPublic(isPublic);
        submission.setVersion(nextVersion);
        
        return submissionRepository.save(submission);
    }

    @Transactional
    public Submission updateVisibility(UUID userId, UUID submissionId, boolean isPublic) {
        Submission submission = getSubmission(submissionId);
        
        if (!submission.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Not your submission");
        }
        
        submission.setIsPublic(isPublic);
        submission.setUpdatedAt(LocalDateTime.now());
        
        return submissionRepository.save(submission);
    }

    public boolean canAccessSubmission(UUID userId, Submission submission) {
        if (Boolean.TRUE.equals(submission.getIsPublic())) {
            return true;
        }
        return userId != null && submission.getUser().getId().equals(userId);
    }

    private SubmissionType validateAndGetFileType(MultipartFile file, Problem problem) {
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        
        SubmissionType detectedType = detectFileType(contentType, fileName);
        
        List<SubmissionType> allowedTypes = problem.getSubmissionTypeList();
        if (!allowedTypes.contains(detectedType)) {
            throw new InvalidFileTypeException("File type not allowed for this problem. Allowed: " + allowedTypes);
        }
        
        return detectedType;
    }

    private void validateFileSize(MultipartFile file, SubmissionType fileType) {
        long fileSize = file.getSize();
        long maxSize = switch (fileType) {
            case PDF -> PDF_MAX_SIZE;
            case MP4 -> MP4_MAX_SIZE;
            case CODE -> CODE_MAX_SIZE;
            case IMAGE -> IMAGE_MAX_SIZE;
        };
        
        if (fileSize > maxSize) {
            String maxSizeMB = String.format("%.0f", maxSize / (1024.0 * 1024.0));
            throw new FileSizeExceededException(
                    "File size exceeds limit. Maximum allowed: " + maxSizeMB + "MB");
        }
    }

    private SubmissionType detectFileType(String contentType, String fileName) {
        if (contentType != null) {
            if (contentType.equals("application/pdf")) {
                return SubmissionType.PDF;
            }
            if (contentType.equals("video/mp4")) {
                return SubmissionType.MP4;
            }
            if (contentType.startsWith("image/")) {
                return SubmissionType.IMAGE;
            }
        }
        
        if (fileName != null) {
            String lowerName = fileName.toLowerCase();
            if (lowerName.endsWith(".pdf")) {
                return SubmissionType.PDF;
            }
            if (lowerName.endsWith(".mp4")) {
                return SubmissionType.MP4;
            }
            if (lowerName.endsWith(".zip") || lowerName.endsWith(".txt") || 
                lowerName.endsWith(".java") || lowerName.endsWith(".py") ||
                lowerName.endsWith(".js") || lowerName.endsWith(".ts")) {
                return SubmissionType.CODE;
            }
            if (lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || 
                lowerName.endsWith(".jpeg") || lowerName.endsWith(".gif")) {
                return SubmissionType.IMAGE;
            }
        }
        
        return SubmissionType.CODE;
    }

    private String generateFileKey(UUID userId, UUID problemId, String originalFilename) {
        long timestamp = System.currentTimeMillis();
        return String.format("submissions/%s/%s/%d-%s", userId, problemId, timestamp, originalFilename);
    }

    @Transactional(readOnly = true)
    public GymProgressResponse getUserProgress(UUID userId) {
        List<Gym> gyms = gymRepository.findByIsPublishedTrueOrderBySortOrder();
        
        int totalGyms = gyms.size();
        int completedGyms = 0;
        int totalProblems = 0;
        int completedProblems = 0;
        int pendingReviews = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PENDING);
        
        List<GymProgressResponse.GymProgressItemResponse> gymItems = gyms.stream()
                .map(gym -> {
                    int problemCount = problemRepository.countByGymId(gym.getId());
                    int completedCount = (int) submissionRepository.countCompletedByUserIdAndGymId(userId, gym.getId());
                    int pendingCount = 0;
                    int progressPercentage = problemCount > 0 ? (completedCount * 100) / problemCount : 0;
                    
                    return new GymProgressResponse.GymProgressItemResponse(
                            gym.getId(),
                            gym.getTitle(),
                            gym.getGymType(),
                            problemCount,
                            completedCount,
                            pendingCount,
                            progressPercentage
                    );
                })
                .collect(Collectors.toList());
        
        for (GymProgressResponse.GymProgressItemResponse item : gymItems) {
            totalProblems += item.problemCount();
            completedProblems += item.completedCount();
            if (item.problemCount() > 0 && item.completedCount() >= item.problemCount()) {
                completedGyms++;
            }
        }
        
        return new GymProgressResponse(
                totalGyms,
                completedGyms,
                totalProblems,
                completedProblems,
                pendingReviews,
                gymItems
        );
    }
}
