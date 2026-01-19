package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.dto.CheckoutRequestDTO;
import br.com.moura.time_tracker.dto.WorkRecordResponseDTO;
import br.com.moura.time_tracker.enums.WorkReason;
import br.com.moura.time_tracker.exception.DataNotFoundException;
import br.com.moura.time_tracker.exception.MissingDetailsForOtherReasonException;
import br.com.moura.time_tracker.exception.MultipleCheckInWithoutCheckOutException;
import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.model.WorkRecord;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.repository.WorkRecordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WorkService {

    private final WorkRecordRepository workRecordRepository;
    private final EmployeeRepository employeeRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public record ChartDataDTO(List<String> categories, List<Double> series) {}

    // 1. Check-in
    @Transactional
    public WorkRecord clockIn(UUID employeeId) {
        if (workRecordRepository.findByEmployeeIdAndCheckOutTimeIsNull(employeeId).isPresent()) {
            throw new MultipleCheckInWithoutCheckOutException("Não é permitido dois check-ins sem check-out");
        }
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new DataNotFoundException("Funcionário não encontrado"));

        WorkRecord newEntry = WorkRecord.builder()
                .employee(employee)
                .checkInTime(LocalDateTime.now())
                .build();

        return workRecordRepository.save(newEntry);
    }

    // 2. Check-out
    @Transactional
    public WorkRecord clockOut(UUID employeeId, CheckoutRequestDTO request) {
        WorkRecord entry = workRecordRepository.findByEmployeeIdAndCheckOutTimeIsNull(employeeId)
                .orElseThrow(() -> new DataNotFoundException("Não há turno aberto para finalizar!"));

        WorkReason reason = WorkReason.fromCode(request.getReason_id());
        if (reason == WorkReason.OTHER) {
            if (request.getDetails() == null || request.getDetails().trim().isEmpty()) {
                throw new MissingDetailsForOtherReasonException("Para o motivo 'Outros', o campo 'details' é obrigatório.");
            }
        }

        entry.setCheckOutTime(LocalDateTime.now());
        entry.setReason(reason);
        entry.setDetails(request.getDetails());

        long seconds = Duration.between(entry.getCheckInTime(), entry.getCheckOutTime()).getSeconds();
        entry.setDurationSeconds(seconds);

        return workRecordRepository.save(entry);
    }

    // 3. Histórico Pessoal PAGINADO
    public Page<WorkRecordResponseDTO> getPersonalRecords(UUID employeeId, String dateStr, Pageable pageable) {
        LocalDate date = (dateStr != null && !dateStr.isEmpty()) ? LocalDate.parse(dateStr) : null;

        Page<WorkRecord> result;

        if (date == null) {
            result = workRecordRepository.findByEmployeeIdOrderByCheckInTimeDesc(employeeId, pageable);
        } else {
            result = workRecordRepository.findByEmployeeIdAndDate(employeeId, date, pageable);
        }

        return result.map(this::toResponseDTO);
    }

    // 4. Resumo Semanal PESSOAL
    public ChartDataDTO getWeeklyPersonalSummary(UUID employeeId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDateTime start = sevenDaysAgo.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<WorkRecord> entries = workRecordRepository.findByEmployeeIdAndCheckInTimeBetween(employeeId, start, end);
        Map<LocalDate, Double> dailyTotals = new LinkedHashMap<>();

        for (int i = 0; i < 7; i++) dailyTotals.put(sevenDaysAgo.plusDays(i), 0.0);

        for (WorkRecord entry : entries) {
            if (entry.getCheckOutTime() != null) {
                LocalDate date = entry.getCheckInTime().toLocalDate();
                dailyTotals.put(date, dailyTotals.getOrDefault(date, 0.0) + (entry.getDurationSeconds() / 3600.0));
            }
        }

        List<String> cats = new ArrayList<>();
        List<Double> sers = new ArrayList<>();
        dailyTotals.forEach((k, v) -> {
            cats.add(k.format(DateTimeFormatter.ofPattern("dd/MM")));
            sers.add(Math.round(v * 100.0) / 100.0);
        });
        return new ChartDataDTO(cats, sers);
    }

    // --- HELPER ---
    private WorkRecordResponseDTO toResponseDTO(WorkRecord record) {
        long seconds = record.getDurationSeconds() != null ? record.getDurationSeconds() : 0;
        if (record.getCheckOutTime() == null) {
            seconds = Duration.between(record.getCheckInTime(), LocalDateTime.now()).getSeconds();
        }
        String durationStr = String.format("%02d:%02d:%02d", seconds / 3600, (seconds % 3600) / 60, seconds % 60);

        return WorkRecordResponseDTO.builder()
                .id(record.getId())
                .date(record.getCheckInTime().format(DATE_FMT))
                .checkin_time(record.getCheckInTime().format(TIME_FMT))
                .checkout_time(record.getCheckOutTime() != null ? record.getCheckOutTime().format(TIME_FMT) : null)
                .duration(durationStr)
                .duration_seconds(seconds)
                .reason_id(record.getReason() != null ? record.getReason().getCode() : null)
                .reason_label(record.getReason() != null ? record.getReason().getLabel() : null)
                .details(record.getDetails())
                .build();
    }
}