package br.com.moura.time_tracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; 

    // --- NOVOS CAMPOS PARA A ESCALA (Adicionei aqui) ---
    @Column(name = "work_start_time")
    private String workStartTime;

    @Column(name = "work_end_time")
    private String workEndTime;
    // ---------------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Garante que se não for informado, nasce como USER
        if (this.role == null) {
            this.role = "USER";
        }

        // --- VALORES PADRÃO PARA ESCALA ---
        if (this.workStartTime == null) {
            this.workStartTime = "08:00";
        }
        if (this.workEndTime == null) {
            this.workEndTime = "17:00";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}