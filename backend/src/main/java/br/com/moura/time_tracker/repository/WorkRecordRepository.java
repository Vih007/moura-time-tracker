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
import java.util.UUID;

public interface WorkRecordRepository extends JpaRepository<WorkRecord, UUID> {

    Optional<WorkRecord> findByEmployeeIdAndCheckOutTimeIsNull(UUID employeeId);

    List<WorkRecord> findByEmployeeIdOrderByCheckInTimeDesc(UUID employeeId);

    @Query("SELECT w FROM WorkRecord w WHERE " +
           "(:name IS NULL OR LOWER(w.employee.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:date IS NULL OR CAST(w.checkInTime AS date) = :date)")
    Page<WorkRecord> findAllWithFilters(@Param("name") String name, 
                                        @Param("date") LocalDate date, 
                                        Pageable pageable);

    List<WorkRecord> findAllByCheckInTimeBetweenOrderByCheckInTimeAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT w FROM WorkRecord w WHERE w.employee.id = :employeeId " +
           "AND w.checkInTime BETWEEN :start AND :end " +
           "ORDER BY w.checkInTime DESC")
    List<WorkRecord> findReportData(@Param("employeeId") UUID employeeId,
                                    @Param("start") LocalDateTime start,
                                    @Param("end") LocalDateTime end);

    @Query(value = """
        SELECT DISTINCT ON (employee_id) * FROM work_records
        ORDER BY employee_id, checkin_time DESC
    """, nativeQuery = true)
    List<WorkRecord> findLatestRecordPerEmployee();
}