package com.waterball.course.repository;

import com.waterball.course.entity.StagePrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StagePrerequisiteRepository extends JpaRepository<StagePrerequisite, UUID> {
    List<StagePrerequisite> findByStageId(UUID stageId);
}
