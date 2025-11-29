package com.waterballsa.backend.gym.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymSubmissionListResponse {
    private List<GymSubmissionDto> submissions;
    private Long totalCount;
    private Integer page;
    private Integer pageSize;
}
