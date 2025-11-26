package com.waterball.course.repository;

import com.waterball.course.entity.PurchaseOrder;
import com.waterball.course.entity.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
    Optional<PurchaseOrder> findByUserIdAndJourneyIdAndStatus(UUID userId, UUID journeyId, PurchaseStatus status);

    List<PurchaseOrder> findByUserIdAndStatus(UUID userId, PurchaseStatus status);

    Page<PurchaseOrder> findByUserIdAndStatus(UUID userId, PurchaseStatus status, Pageable pageable);

    Page<PurchaseOrder> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.user.id = :userId AND po.status = 'PENDING'")
    List<PurchaseOrder> findPendingByUserId(@Param("userId") UUID userId);
}
