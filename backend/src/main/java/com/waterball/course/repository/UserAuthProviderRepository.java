package com.waterball.course.repository;

import com.waterball.course.entity.AuthProvider;
import com.waterball.course.entity.UserAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAuthProviderRepository extends JpaRepository<UserAuthProvider, UUID> {
    Optional<UserAuthProvider> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
    List<UserAuthProvider> findByUserId(UUID userId);
    boolean existsByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
