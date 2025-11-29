package com.waterballsa.backend.gym.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GymExerciseListResponse {
    private List<GymExerciseDto> exercises;
}
