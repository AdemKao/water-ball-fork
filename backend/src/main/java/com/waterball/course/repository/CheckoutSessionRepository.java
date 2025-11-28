package com.waterball.course.repository;

import com.waterball.course.entity.CheckoutSession;
import com.waterball.course.entity.CheckoutSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CheckoutSessionRepository extends JpaRepository<CheckoutSession, String> {

    Optional<CheckoutSession> findByPurchaseOrderId(UUID purchaseOrderId);

    List<CheckoutSession> findByStatusAndExpiresAtBefore(CheckoutSessionStatus status, Instant time);
}
