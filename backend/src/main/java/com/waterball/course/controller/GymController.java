package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.gym.*;
import com.waterball.course.entity.*;
import com.waterball.course.exception.StageNotFoundException;
import com.waterball.course.service.gym.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class GymController {
    private final GymService gymService;
    private final StageService stageService;
    private final ProblemService problemService;
    private final PrerequisiteService prerequisiteService;

    @GetMapping
    public ResponseEntity<List<GymListItemResponse>> getGyms(
            @RequestParam(required = false) UUID journeyId,
            @RequestParam(required = false) GymType type,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getUser().getId() : null;
        
        List<Gym> gyms = gymService.getGyms(journeyId, type);
        List<GymListItemResponse> response = gyms.stream()
                .map(gym -> toGymListItem(gym, userId))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gymId}")
    public ResponseEntity<GymDetailResponse> getGymDetail(
            @PathVariable UUID gymId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getUser().getId() : null;
        
        Gym gym = gymService.getGym(gymId);
        List<Stage> stages = gymService.getGymStages(gymId);
        List<Gym> relatedGyms = gymService.getRelatedGyms(gym.getJourney().getId(), gymId);
        
        GymDetailResponse response = new GymDetailResponse(
                gym.getId(),
                gym.getJourney().getId(),
                gym.getJourney().getTitle(),
                gym.getTitle(),
                gym.getDescription(),
                gym.getThumbnailUrl(),
                gym.getGymType(),
                stages.stream().map(stage -> toStageSummary(stage, userId)).collect(Collectors.toList()),
                gymService.isPurchased(userId, gym.getJourney().getId()),
                relatedGyms.stream().map(this::toGymSummary).collect(Collectors.toList())
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gymId}/stages/{stageId}")
    public ResponseEntity<StageDetailResponse> getStageDetail(
            @PathVariable UUID gymId,
            @PathVariable UUID stageId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getUser().getId() : null;
        
        Stage stage = stageService.getStageByGym(gymId, stageId);
        Gym gym = stage.getGym();
        
        boolean isPurchased = gymService.isPurchased(userId, gym.getJourney().getId());
        boolean isUnlocked = isPurchased && stageService.isStageUnlocked(userId, stage);
        
        List<StageDetailResponse.ProblemSummaryResponse> problems;
        if (isPurchased) {
            problems = stageService.getStageProblems(stageId).stream()
                    .map(problem -> toProblemSummary(problem, userId))
                    .collect(Collectors.toList());
        } else {
            problems = List.of();
        }
        
        List<StageDetailResponse.PrerequisiteInfoResponse> prerequisites = 
                prerequisiteService.getStagePrerequisiteInfos(stageId, userId).stream()
                        .map(this::toStagePrerequisiteInfo)
                        .collect(Collectors.toList());
        
        StageDetailResponse response = new StageDetailResponse(
                stage.getId(),
                gym.getId(),
                gym.getTitle(),
                stage.getTitle(),
                stage.getDescription(),
                stage.getDifficulty(),
                problems,
                isUnlocked,
                isPurchased,
                prerequisites
        );
        
        return ResponseEntity.ok(response);
    }

    private GymListItemResponse toGymListItem(Gym gym, UUID userId) {
        return new GymListItemResponse(
                gym.getId(),
                gym.getJourney().getId(),
                gym.getJourney().getTitle(),
                gym.getTitle(),
                gym.getDescription(),
                gym.getThumbnailUrl(),
                gym.getGymType(),
                gymService.getStageCount(gym.getId()),
                gymService.getProblemCount(gym.getId()),
                gymService.getCompletedProblemCount(userId, gym.getId()),
                gymService.isPurchased(userId, gym.getJourney().getId())
        );
    }

    private GymDetailResponse.StageSummaryResponse toStageSummary(Stage stage, UUID userId) {
        List<GymDetailResponse.PrerequisiteInfoResponse> prerequisites = 
                prerequisiteService.getStagePrerequisiteInfos(stage.getId(), userId).stream()
                        .map(this::toGymPrerequisiteInfo)
                        .collect(Collectors.toList());
        
        return new GymDetailResponse.StageSummaryResponse(
                stage.getId(),
                stage.getTitle(),
                stage.getDescription(),
                stage.getDifficulty(),
                stageService.getProblemCount(stage.getId()),
                stageService.getCompletedProblemCount(userId, stage.getId()),
                stageService.isStageUnlocked(userId, stage),
                prerequisites
        );
    }

    private GymDetailResponse.GymSummaryResponse toGymSummary(Gym gym) {
        return new GymDetailResponse.GymSummaryResponse(
                gym.getId(),
                gym.getTitle(),
                gym.getGymType()
        );
    }

    private GymDetailResponse.PrerequisiteInfoResponse toGymPrerequisiteInfo(PrerequisiteService.PrerequisiteInfo info) {
        return new GymDetailResponse.PrerequisiteInfoResponse(
                info.type(),
                info.id(),
                info.title(),
                info.isCompleted()
        );
    }

    private StageDetailResponse.PrerequisiteInfoResponse toStagePrerequisiteInfo(PrerequisiteService.PrerequisiteInfo info) {
        return new StageDetailResponse.PrerequisiteInfoResponse(
                info.type(),
                info.id(),
                info.title(),
                info.isCompleted()
        );
    }

    private StageDetailResponse.ProblemSummaryResponse toProblemSummary(Problem problem, UUID userId) {
        return new StageDetailResponse.ProblemSummaryResponse(
                problem.getId(),
                problem.getTitle(),
                problem.getDifficulty(),
                problem.getSubmissionTypeList(),
                problemService.isProblemCompleted(userId, problem.getId()),
                problemService.isProblemUnlocked(userId, problem),
                problemService.getLatestSubmissionStatus(userId, problem.getId()).orElse(null)
        );
    }
}
