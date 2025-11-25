package com.waterball.course.dto.response;

import com.waterball.course.entity.User;
import com.waterball.course.entity.UserRole;
import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private String pictureUrl;
    private UserRole role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole())
                .build();
    }
}
