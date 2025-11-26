package com.waterball.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneyListResponse {
    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private int chapterCount;
    private int lessonCount;
    private int totalDurationSeconds;
    private Integer price;
    private String currency;
    private Integer originalPrice;
    private Integer discountPercentage;
}
