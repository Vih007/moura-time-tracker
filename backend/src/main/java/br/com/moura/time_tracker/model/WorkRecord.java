package br.com.moura.time_tracker.model;

import br.com.moura.time_tracker.enums.WorkReason;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "checkin_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "checkout_time")
    private LocalDateTime checkOutTime;

    @Column(name = "duration_seconds")
    private Long durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_id")
    private WorkReason reason;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}