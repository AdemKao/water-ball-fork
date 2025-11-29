package com.waterball.course.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "problem_prerequisites")
@Getter @Setter
@NoArgsConstructor
public class ProblemPrerequisite {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_lesson_id")
    private Lesson prerequisiteLesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_problem_id")
    private Problem prerequisiteProblem;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public PrerequisiteType getType() {
        if (prerequisiteLesson != null) {
            return PrerequisiteType.LESSON;
        }
        return PrerequisiteType.PROBLEM;
    }
}
