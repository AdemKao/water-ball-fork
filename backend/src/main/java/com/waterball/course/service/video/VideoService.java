package com.waterball.course.service.video;

import com.waterball.course.dto.response.VideoStreamResponse;
import com.waterball.course.entity.Lesson;
import com.waterball.course.entity.Video;
import com.waterball.course.exception.AccessDeniedException;
import com.waterball.course.repository.LessonRepository;
import com.waterball.course.repository.VideoRepository;
import com.waterball.course.service.StorageService;
import com.waterball.course.service.course.AccessControlService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepository;
    private final LessonRepository lessonRepository;
    private final AccessControlService accessControlService;
    private final StorageService storageService;

    @Value("${video.signed-url-expiration:3600}")
    private int signedUrlExpiration;

    public VideoStreamResponse getVideoStream(UUID videoId, UUID userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new EntityNotFoundException("Video not found: " + videoId));

        Lesson lesson = lessonRepository.findAll().stream()
                .filter(l -> l.getVideo() != null && l.getVideo().getId().equals(videoId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found for video: " + videoId));

        if (!accessControlService.canAccessLesson(lesson, userId)) {
            throw new AccessDeniedException("無權限存取此影片");
        }

        String streamUrl = storageService.generateSignedUrl(video.getStoragePath(), signedUrlExpiration);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(signedUrlExpiration);

        return VideoStreamResponse.builder()
                .streamUrl(streamUrl)
                .expiresAt(expiresAt)
                .durationSeconds(video.getDurationSeconds())
                .build();
    }

    public String generateStreamUrl(UUID videoId) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) {
            return null;
        }
        return storageService.generateSignedUrl(video.getStoragePath(), signedUrlExpiration);
    }
}
