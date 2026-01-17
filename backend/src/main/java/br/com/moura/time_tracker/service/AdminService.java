package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.dto.WorkRecordResponseDTO;
import br.com.moura.time_tracker.model.WorkRecord;
import br.com.moura.time_tracker.repository.WorkRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final WorkRecordRepository workRecordRepository;

    public List<DashboardStatusDTO> getTeamCurrentStatus() {
        List<WorkRecord> latestRecords = workRecordRepository.findLatestRecordPerEmployee();

        return latestRecords.stream().map(record -> DashboardStatusDTO.builder()
                .id(record.getId())
                .employeeId(record.getEmployee().getId())
                .name(record.getEmployee().getName())
                .startTime(record.getCheckInTime())
                .endTime(record.getCheckOutTime())
                .durationSeconds(record.getDurationSeconds())
                .build()).collect(Collectors.toList());
    }

    public List<WorkRecordResponseDTO> generateReport(Long employeeId, String startDate, String endDate) {
        LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);

        List<WorkRecord> records = workRecordRepository.findReportData(employeeId, start, end);

        return records.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private WorkRecordResponseDTO toDTO(WorkRecord r) {
        return WorkRecordResponseDTO.builder()
                .id(r.getId())
                .date(r.getCheckInTime().toLocalDate().toString())
                .checkin_time(r.getCheckInTime().toLocalTime().toString())
                .checkout_time(r.getCheckOutTime() != null ? r.getCheckOutTime().toLocalTime().toString() : null)
                .duration_seconds(r.getDurationSeconds())
                .reason_label(r.getReason() != null ? r.getReason().getLabel() : "Trabalho")
                .build();
    }

    @lombok.Builder
    @lombok.Data
    public static class DashboardStatusDTO {
        private Long id;
        private Long employeeId;
        private String name;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Long durationSeconds;
    }

    public record ChartDataDTO(List<String> categories, List<Double> series) {}
    public record RankingDTO(String name, Double totalHours) {}

    public ChartDataDTO getWeeklyTeamSummary() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDateTime start = sevenDaysAgo.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<WorkRecord> entries = workRecordRepository.findAllByCheckInTimeBetweenOrderByCheckInTimeAsc(start, end);
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

    public List<RankingDTO> getEmployeeRanking() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.minusDays(6).atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<WorkRecord> entries = workRecordRepository.findAllByCheckInTimeBetweenOrderByCheckInTimeAsc(start, end);
        Map<String, Long> rankingMap = new HashMap<>();

        for (WorkRecord entry : entries) {
            if (entry.getCheckOutTime() != null && entry.getEmployee() != null) {
                long seconds = entry.getDurationSeconds() != null ? entry.getDurationSeconds() : 0;
                rankingMap.merge(entry.getEmployee().getName(), seconds, Long::sum);
            }
        }
        return rankingMap.entrySet().stream()
                .map(e -> new RankingDTO(e.getKey(), Math.round((e.getValue() / 3600.0) * 100.0) / 100.0))
                .sorted(Comparator.comparingDouble(RankingDTO::totalHours).reversed())
                .collect(Collectors.toList());
    }
}