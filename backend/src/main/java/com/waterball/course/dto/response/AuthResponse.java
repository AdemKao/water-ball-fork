package com.waterball.course.dto.response;

import com.waterball.course.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private UserResponse user;

    public static AuthResponse of(User user) {
        return new AuthResponse(UserResponse.from(user));
    }
}
