package com.waterball.course.service.gym;

import com.waterball.course.entity.Problem;
import com.waterball.course.entity.Submission;
import com.waterball.course.entity.SubmissionStatus;
import com.waterball.course.exception.ProblemNotFoundException;
import com.waterball.course.repository.ProblemRepository;
import com.waterball.course.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProblemService {
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final GymAccessControlService gymAccessControlService;

    public Problem getProblem(UUID problemId) {
        return problemRepository.findById(problemId)
                .orElseThrow(() -> new ProblemNotFoundException("Problem not found: " + problemId));
    }

    public boolean isProblemUnlocked(UUID userId, Problem problem) {
        return gymAccessControlService.isProblemUnlocked(userId, problem);
    }

    public boolean isProblemCompleted(UUID userId, UUID problemId) {
        return gymAccessControlService.isProblemCompleted(userId, problemId);
    }

    public Optional<Submission> getLatestSubmission(UUID userId, UUID problemId) {
        if (userId == null) {
            return Optional.empty();
        }
        return submissionRepository.findTopByUserIdAndProblemIdOrderByVersionDesc(userId, problemId);
    }

    public Optional<SubmissionStatus> getLatestSubmissionStatus(UUID userId, UUID problemId) {
        return getLatestSubmission(userId, problemId).map(Submission::getStatus);
    }

    public Optional<Problem> getPreviousProblem(UUID stageId, int sortOrder) {
        return problemRepository.findPreviousProblem(stageId, sortOrder);
    }

    public Optional<Problem> getNextProblem(UUID stageId, int sortOrder) {
        return problemRepository.findNextProblem(stageId, sortOrder);
    }
}
