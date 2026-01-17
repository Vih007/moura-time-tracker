package br.com.moura.time_tracker.repository;

import br.com.moura.time_tracker.model.WorkRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {

    // Verifica ponto em aberto (checkOutTime nulo)
    Optional<WorkRecord> findByEmployeeIdAndCheckOutTimeIsNull(Long employeeId);

    // Histórico de um funcionário
    List<WorkRecord> findByEmployeeIdOrderByCheckInTimeDesc(Long employeeId);

    // --- REQUISITO PDF: Filtro por nome e data com paginação ---
    @Query("SELECT w FROM WorkRecord w WHERE " +
           "(:name IS NULL OR LOWER(w.employee.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:date IS NULL OR CAST(w.checkInTime AS date) = :date)")
    Page<WorkRecord> findAllWithFilters(@Param("name") String name, 
                                        @Param("date") LocalDate date, 
                                        Pageable pageable);

    // --- GRÁFICOS (Adaptado para checkInTime) ---
    List<WorkRecord> findAllByCheckInTimeBetweenOrderByCheckInTimeAsc(LocalDateTime start, LocalDateTime end);
}