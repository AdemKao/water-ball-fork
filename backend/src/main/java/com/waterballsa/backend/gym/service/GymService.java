package com.waterballsa.backend.gym.service;

import com.waterball.course.dto.gym.GymDto;
import com.waterballsa.backend.gym.domain.Gym;
import com.waterballsa.backend.gym.dto.GymListResponse;
import com.waterballsa.backend.gym.repository.GymRepository;
import com.waterballsa.backend.gym.repository.GymSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GymService {

    private final GymRepository gymRepository;
    private final GymSubmissionRepository gymSubmissionRepository;

    public GymListResponse getGymsByJourney(UUID journeyId, UUID userId) {
        List<Gym> gyms = gymRepository.findByJourneyIdOrderByDisplayOrderAsc(journeyId);
        List<GymDto> gymDtos = gyms.stream()
            .map(gym -> toDto(gym, userId))
            .collect(Collectors.toList());
        return GymListResponse.builder().gyms(gymDtos).build();
    }

    public GymDto getGymById(Long id, UUID userId) {
        Gym gym = gymRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Gym not found: " + id));
        return toDto(gym, userId);
    }

    private GymDto toDto(Gym gym, UUID userId) {
        int exerciseCount = gym.getExercises().size();
        long completedCount = userId != null ?
            gymSubmissionRepository.countApprovedExercisesByGymAndUser(gym.getId(), userId) : 0;

        return GymDto.builder()
            .id(gym.getId())
            .journeyId(gym.getJourney().getId())
            .title(gym.getTitle())
            .description(gym.getDescription())
            .displayOrder(gym.getDisplayOrder())
            .exerciseCount(exerciseCount)
            .completedCount((int) completedCount)
            .createdAt(gym.getCreatedAt())
            .updatedAt(gym.getUpdatedAt())
            .build();
    }
}
