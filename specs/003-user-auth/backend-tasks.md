# Backend Implementation Tasks: User Authentication

## Phase 1: Database & Entity

### Task 1.1: 建立 Flyway Migration

**檔案:** `src/main/resources/db/migration/V2__create_users_and_auth_tables.sql`

```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    picture_url VARCHAR(500),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- user_auth_providers table
CREATE TABLE user_auth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_user_auth_providers_user_id ON user_auth_providers(user_id);
CREATE INDEX idx_user_auth_providers_lookup ON user_auth_providers(provider, provider_user_id);

-- refresh_tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

---

### Task 1.2: 建立 User Entity

**檔案:** `src/main/java/com/waterball/course/entity/User.java`

```java
@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAuthProvider> authProviders = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### Task 1.3: 建立 UserRole Enum

**檔案:** `src/main/java/com/waterball/course/entity/UserRole.java`

```java
public enum UserRole {
    ADMIN,
    TEACHER,
    STUDENT
}
```

---

### Task 1.4: 建立 AuthProvider Enum

**檔案:** `src/main/java/com/waterball/course/entity/AuthProvider.java`

```java
public enum AuthProvider {
    GOOGLE,
    GITHUB,
    LINE,
    EMAIL
}
```

---

### Task 1.5: 建立 UserAuthProvider Entity

**檔案:** `src/main/java/com/waterball/course/entity/UserAuthProvider.java`

```java
@Entity
@Table(name = "user_auth_providers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_user_id"}))
@Getter @Setter
@NoArgsConstructor
public class UserAuthProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    @Column(name = "provider_user_id", nullable = false)
    private String providerUserId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UserAuthProvider(User user, AuthProvider provider, String providerUserId) {
        this.user = user;
        this.provider = provider;
        this.providerUserId = providerUserId;
    }
}
```

---

### Task 1.6: 建立 RefreshToken Entity

**檔案:** `src/main/java/com/waterball/course/entity/RefreshToken.java`

```java
@Entity
@Table(name = "refresh_tokens")
@Getter @Setter
@NoArgsConstructor
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

---

### Task 1.7: 建立 UserRepository

**檔案:** `src/main/java/com/waterball/course/repository/UserRepository.java`

```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

---

### Task 1.8: 建立 UserAuthProviderRepository

**檔案:** `src/main/java/com/waterball/course/repository/UserAuthProviderRepository.java`

```java
@Repository
public interface UserAuthProviderRepository extends JpaRepository<UserAuthProvider, UUID> {
    Optional<UserAuthProvider> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
    List<UserAuthProvider> findByUserId(UUID userId);
    boolean existsByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
```

---

### Task 1.9: 建立 RefreshTokenRepository

**檔案:** `src/main/java/com/waterball/course/repository/RefreshTokenRepository.java`

```java
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByUserId(UUID userId);
    void deleteByTokenHash(String tokenHash);
    void deleteAllByExpiresAtBefore(LocalDateTime dateTime);
}
```

---

## Phase 2: DTO Classes

### Task 2.1: 建立 GoogleLoginRequest

**檔案:** `src/main/java/com/waterball/course/dto/request/GoogleLoginRequest.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {
    @NotBlank(message = "Credential is required")
    private String credential;
}
```

---

### Task 2.2: 建立 UserResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/UserResponse.java`

```java
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
```

---

### Task 2.3: 建立 AuthResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/AuthResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private UserResponse user;

    public static AuthResponse of(User user) {
        return new AuthResponse(UserResponse.from(user));
    }
}
```

---

### Task 2.4: 建立 MessageResponse

**檔案:** `src/main/java/com/waterball/course/dto/response/MessageResponse.java`

```java
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String message;

    public static MessageResponse of(String message) {
        return new MessageResponse(message);
    }
}
```

---

## Phase 3: Service Layer

### Task 3.1: 新增 pom.xml 依賴

**檔案:** `pom.xml`

```xml
<dependency>
    <groupId>com.google.api-client</groupId>
    <artifactId>google-api-client</artifactId>
    <version>2.2.0</version>
</dependency>
```

---

### Task 3.2: 建立 JwtService

**檔案:** `src/main/java/com/waterball/course/service/auth/JwtService.java`

```java
@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    public String generateAccessToken(User user) {
        return generateToken(user, accessExpiration);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, refreshExpiration);
    }

    private String generateToken(User user, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole() != null ? user.getRole().name() : null)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return UUID.fromString(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    public long getAccessExpiration() {
        return accessExpiration;
    }

    public long getRefreshExpiration() {
        return refreshExpiration;
    }
}
```

---

### Task 3.3: 建立 GoogleAuthService

**檔案:** `src/main/java/com/waterball/course/service/auth/GoogleAuthService.java`

```java
@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    @Value("${google.client-id}")
    private String googleClientId;

    public GoogleUserInfo verifyIdToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new InvalidCredentialException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            return new GoogleUserInfo(
                    payload.getSubject(),
                    payload.getEmail(),
                    (String) payload.get("name"),
                    (String) payload.get("picture")
            );
        } catch (Exception e) {
            throw new InvalidCredentialException("Failed to verify Google ID token: " + e.getMessage());
        }
    }

    @Getter
    @AllArgsConstructor
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String name;
        private String pictureUrl;
    }
}
```

---

### Task 3.4: 建立 InvalidCredentialException

**檔案:** `src/main/java/com/waterball/course/exception/InvalidCredentialException.java`

```java
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidCredentialException extends RuntimeException {
    public InvalidCredentialException(String message) {
        super(message);
    }
}
```

---

### Task 3.5: 建立 AuthService

**檔案:** `src/main/java/com/waterball/course/service/auth/AuthService.java`

```java
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
```

---

### Task 3.6: 建立 UserService

**檔案:** `src/main/java/com/waterball/course/service/UserService.java`

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }
}
```

---

## Phase 4: Security Configuration

### Task 4.1: 建立 JwtAuthenticationFilter

**檔案:** `src/main/java/com/waterball/course/config/JwtAuthenticationFilter.java`

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String accessToken = extractTokenFromCookie(request, "access_token");

        if (accessToken != null && jwtService.validateToken(accessToken)) {
            UUID userId = jwtService.getUserIdFromToken(accessToken);
            userService.findById(userId).ifPresent(user -> {
                UserPrincipal principal = new UserPrincipal(user);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
```

---

### Task 4.2: 建立 UserPrincipal

**檔案:** `src/main/java/com/waterball/course/config/UserPrincipal.java`

```java
@Getter
@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {
    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (user.getRole() == null) {
            return Collections.emptyList();
        }
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

---

### Task 4.3: 更新 SecurityConfig

**檔案:** `src/main/java/com/waterball/course/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/google", "/api/auth/refresh").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3388"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

### Task 4.4: 建立 CookieService

**檔案:** `src/main/java/com/waterball/course/service/auth/CookieService.java`

```java
@Service
public class CookieService {
    @Value("${cookie.domain:localhost}")
    private String cookieDomain;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    public ResponseCookie createAccessTokenCookie(String token) {
        return ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(accessExpiration / 1000)
                .build();
    }

    public ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(refreshExpiration / 1000)
                .build();
    }

    public ResponseCookie createExpiredAccessTokenCookie() {
        return ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
    }

    public ResponseCookie createExpiredRefreshTokenCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }
}
```

---

## Phase 5: Controller Layer

### Task 5.1: 建立 AuthController

**檔案:** `src/main/java/com/waterball/course/controller/AuthController.java`

```java
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
```

---

## Phase 6: Configuration

### Task 6.1: 更新 application.yml

**檔案:** `src/main/resources/application.yml`

```yaml
# 新增以下配置
google:
  client-id: ${GOOGLE_CLIENT_ID}

jwt:
  secret: ${JWT_SECRET}
  access-expiration: ${JWT_ACCESS_EXPIRATION:1800000}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:2592000000}

cookie:
  domain: ${COOKIE_DOMAIN:localhost}
  secure: ${COOKIE_SECURE:false}
```

---

### Task 6.2: 更新 GlobalExceptionHandler

**檔案:** `src/main/java/com/waterball/course/exception/GlobalExceptionHandler.java`

```java
// 新增處理 InvalidCredentialException
@ExceptionHandler(InvalidCredentialException.class)
public ResponseEntity<ErrorResponse> handleInvalidCredential(InvalidCredentialException ex) {
    ErrorResponse error = new ErrorResponse("Unauthorized", ex.getMessage());
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
}

@Getter
@AllArgsConstructor
public static class ErrorResponse {
    private String error;
    private String message;
}
```

---

## Phase 7: Testing

### Task 7.1: 建立 JwtServiceTest

**檔案:** `src/test/java/com/waterball/course/service/JwtServiceTest.java`

**測試案例:**

- `generateAccessToken_shouldCreateValidToken`
- `generateRefreshToken_shouldCreateValidToken`
- `validateToken_withValidToken_shouldReturnTrue`
- `validateToken_withInvalidToken_shouldReturnFalse`
- `validateToken_withExpiredToken_shouldReturnFalse`
- `getUserIdFromToken_shouldReturnCorrectUserId`
- `hashToken_shouldReturnConsistentHash`

---

### Task 7.2: 建立 AuthServiceTest

**檔案:** `src/test/java/com/waterball/course/service/AuthServiceTest.java`

**測試案例:**

- `loginWithGoogle_newUser_shouldCreateUserAndReturnTokens`
- `loginWithGoogle_existingUser_shouldReturnTokens`
- `loginWithGoogle_existingEmailDifferentProvider_shouldLinkAccount`
- `refreshToken_withValidToken_shouldReturnNewAccessToken`
- `refreshToken_withInvalidToken_shouldThrowException`
- `refreshToken_withExpiredToken_shouldThrowException`
- `logout_shouldDeleteRefreshToken`

---

### Task 7.3: 建立 AuthControllerTest

**檔案:** `src/test/java/com/waterball/course/controller/AuthControllerTest.java`

**測試案例:**

- `googleLogin_withValidCredential_shouldReturnUserAndSetCookies`
- `googleLogin_withInvalidCredential_shouldReturn401`
- `refresh_withValidRefreshToken_shouldReturnNewAccessToken`
- `refresh_withoutRefreshToken_shouldReturn401`
- `logout_shouldClearCookies`
- `me_withValidAccessToken_shouldReturnUser`
- `me_withoutAccessToken_shouldReturn401`

---

## Checklist

### Phase 1: Database & Entity

- [x] Task 1.1: Flyway Migration
- [x] Task 1.2: User Entity
- [x] Task 1.3: UserRole Enum
- [x] Task 1.4: AuthProvider Enum
- [x] Task 1.5: UserAuthProvider Entity
- [x] Task 1.6: RefreshToken Entity
- [x] Task 1.7: UserRepository
- [x] Task 1.8: UserAuthProviderRepository
- [x] Task 1.9: RefreshTokenRepository

### Phase 2: DTO Classes

- [x] Task 2.1: GoogleLoginRequest
- [x] Task 2.2: UserResponse
- [x] Task 2.3: AuthResponse
- [x] Task 2.4: MessageResponse

### Phase 3: Service Layer

- [x] Task 3.1: pom.xml 依賴
- [x] Task 3.2: JwtService
- [x] Task 3.3: GoogleAuthService
- [x] Task 3.4: InvalidCredentialException
- [x] Task 3.5: AuthService
- [x] Task 3.6: UserService

### Phase 4: Security Configuration

- [x] Task 4.1: JwtAuthenticationFilter
- [x] Task 4.2: UserPrincipal
- [x] Task 4.3: SecurityConfig 更新
- [x] Task 4.4: CookieService

### Phase 5: Controller Layer

- [x] Task 5.1: AuthController

### Phase 6: Configuration

- [x] Task 6.1: application.yml 更新
- [x] Task 6.2: GlobalExceptionHandler 更新

### Phase 7: Testing

- [ ] Task 7.1: JwtServiceTest
- [ ] Task 7.2: AuthServiceTest
- [x] Task 7.3: AuthControllerTest (10/10 tests passing)
