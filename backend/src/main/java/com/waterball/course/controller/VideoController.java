package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.response.VideoStreamResponse;
import com.waterball.course.service.video.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;

    @GetMapping("/{videoId}/stream")
    public ResponseEntity<VideoStreamResponse> getVideoStream(
            @PathVariable UUID videoId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(
                videoService.getVideoStream(videoId, principal.getUser().getId()));
    }
}
