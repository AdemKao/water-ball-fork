package com.waterballsa.backend.gym.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.gym.GymDto;
import com.waterballsa.backend.gym.dto.GymListResponse;
import com.waterballsa.backend.gym.service.GymService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class GymController {

    private final GymService gymService;

    @GetMapping("/journeys/{journeyId}/gyms")
    public ResponseEntity<GymListResponse> getGymsByJourney(
            @PathVariable UUID journeyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("Getting gyms for journey: {}", journeyId);
        UUID userId = principal != null ? principal.getUser().getId() : null;
        GymListResponse response = gymService.getGymsByJourney(journeyId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gyms/{gymId}")
    public ResponseEntity<GymDto> getGym(
            @PathVariable Long gymId,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("Getting gym: {}", gymId);
        UUID userId = principal != null ? principal.getUser().getId() : null;
        GymDto gym = gymService.getGymById(gymId, userId);
        return ResponseEntity.ok(gym);
    }
}
