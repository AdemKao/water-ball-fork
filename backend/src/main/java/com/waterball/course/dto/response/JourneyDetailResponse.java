package com.waterball.course.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyDetailResponse {
    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private List<ChapterResponse> chapters;
    @JsonProperty("isPurchased")
    private boolean isPurchased;
    private Integer price;
    private String currency;
    private Integer originalPrice;
    private Integer discountPercentage;
}
