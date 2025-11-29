package com.waterballsa.backend.gym.dto;

import com.waterball.course.dto.gym.GymDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymListResponse {
    private List<GymDto> gyms;
}
