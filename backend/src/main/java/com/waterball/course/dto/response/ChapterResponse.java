package com.waterball.course.dto.response;

import com.waterball.course.entity.AccessType;
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
public class ChapterResponse {
    private UUID id;
    private String title;
    private String description;
    private int sortOrder;
    private AccessType accessType;
    private List<LessonSummaryResponse> lessons;
}
