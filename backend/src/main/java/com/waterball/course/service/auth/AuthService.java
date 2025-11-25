package com.waterball.course.service.auth;

import com.waterball.course.entity.AuthProvider;
import com.waterball.course.entity.RefreshToken;
import com.waterball.course.entity.User;
import com.waterball.course.entity.UserAuthProvider;
import com.waterball.course.exception.InvalidCredentialException;
import com.waterball.course.repository.RefreshTokenRepository;
import com.waterball.course.repository.UserAuthProviderRepository;
import com.waterball.course.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final UserAuthProviderRepository authProviderRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final GoogleAuthService googleAuthService;
    private final JwtService jwtService;

    public AuthResult loginWithGoogle(String credential) {
        GoogleAuthService.GoogleUserInfo googleUser = googleAuthService.verifyIdToken(credential);

        User user = authProviderRepository
                .findByProviderAndProviderUserId(AuthProvider.GOOGLE, googleUser.getGoogleId())
                .map(UserAuthProvider::getUser)
                .orElseGet(() -> createUserFromGoogle(googleUser));

        return createAuthResult(user);
    }

    private User createUserFromGoogle(GoogleAuthService.GoogleUserInfo googleUser) {
        User existingUser = userRepository.findByEmail(googleUser.getEmail()).orElse(null);

        if (existingUser != null) {
            UserAuthProvider authProvider = new UserAuthProvider(
                    existingUser, AuthProvider.GOOGLE, googleUser.getGoogleId());
            authProviderRepository.save(authProvider);
            return existingUser;
        }

        User newUser = new User();
        newUser.setEmail(googleUser.getEmail());
        newUser.setName(googleUser.getName());
        newUser.setPictureUrl(googleUser.getPictureUrl());
        userRepository.save(newUser);

        UserAuthProvider authProvider = new UserAuthProvider(
                newUser, AuthProvider.GOOGLE, googleUser.getGoogleId());
        authProviderRepository.save(authProvider);

        return newUser;
    }

    private AuthResult createAuthResult(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setTokenHash(jwtService.hashToken(refreshToken));
        refreshTokenEntity.setExpiresAt(LocalDateTime.now()
                .plusSeconds(jwtService.getRefreshExpiration() / 1000));
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthResult(user, accessToken, refreshToken);
    }

    public AuthResult refreshToken(String refreshToken) {
        if (!jwtService.validateToken(refreshToken)) {
            throw new InvalidCredentialException("Invalid refresh token");
        }

        String tokenHash = jwtService.hashToken(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidCredentialException("Refresh token not found"));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new InvalidCredentialException("Refresh token expired");
        }

        User user = storedToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);

        return new AuthResult(user, newAccessToken, null);
    }

    public void logout(String refreshToken) {
        if (refreshToken != null) {
            String tokenHash = jwtService.hashToken(refreshToken);
            refreshTokenRepository.deleteByTokenHash(tokenHash);
        }
    }

    @Getter
    @AllArgsConstructor
    public static class AuthResult {
        private User user;
        private String accessToken;
        private String refreshToken;
    }
}
