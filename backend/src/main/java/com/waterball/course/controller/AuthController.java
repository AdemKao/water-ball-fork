package com.waterball.course.controller;

import com.waterball.course.config.UserPrincipal;
import com.waterball.course.dto.request.GoogleLoginRequest;
import com.waterball.course.dto.response.AuthResponse;
import com.waterball.course.dto.response.MessageResponse;
import com.waterball.course.dto.response.UserResponse;
import com.waterball.course.exception.InvalidCredentialException;
import com.waterball.course.service.auth.AuthService;
import com.waterball.course.service.auth.CookieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final CookieService cookieService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request) {
        AuthService.AuthResult result = authService.loginWithGoogle(request.getCredential());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createAccessTokenCookie(result.getAccessToken()).toString())
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createRefreshTokenCookie(result.getRefreshToken()).toString())
                .body(AuthResponse.of(result.getUser()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<MessageResponse> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null) {
            throw new InvalidCredentialException("Refresh token not found");
        }

        AuthService.AuthResult result = authService.refreshToken(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createAccessTokenCookie(result.getAccessToken()).toString())
                .body(MessageResponse.of("Token refreshed"));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        authService.logout(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createExpiredAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE,
                        cookieService.createExpiredRefreshTokenCookie().toString())
                .body(MessageResponse.of("Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(UserResponse.from(principal.getUser()));
    }
}
