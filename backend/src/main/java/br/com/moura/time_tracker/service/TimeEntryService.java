package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.model.TimeEntry;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*; // Import genérico para Map, List, HashMap, LinkedHashMap
import java.util.stream.Collectors; // Import para streams

@Service
@RequiredArgsConstructor
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;

    // 1. Check-in
    public TimeEntry clockIn(Long employeeId) {
        var openEntry = timeEntryRepository.findByEmployeeIdAndEndTimeIsNull(employeeId);
        if (openEntry.isPresent()) {
            throw new RuntimeException("Você já tem um turno em andamento!");
        }
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        TimeEntry newEntry = TimeEntry.builder()
                .employee(employee)
                .startTime(LocalDateTime.now())
                .build();

        return timeEntryRepository.save(newEntry);
    }

    // 2. Check-out
    public TimeEntry clockOut(Long employeeId) {
        TimeEntry entry = timeEntryRepository.findByEmployeeIdAndEndTimeIsNull(employeeId)
                .orElseThrow(() -> new RuntimeException("Não há turno aberto!"));

        entry.setEndTime(LocalDateTime.now());
        long seconds = Duration.between(entry.getStartTime(), entry.getEndTime()).getSeconds();
        entry.setDurationSeconds(seconds);

        return timeEntryRepository.save(entry);
    }

    // 3. Histórico
    public List<TimeEntry> getHistoryByEmployee(Long employeeId) {
        return timeEntryRepository.findByEmployeeIdOrderByStartTimeDesc(employeeId);
    }

    // 4. Tudo
    public List<TimeEntry> getAllHistory() {
        return timeEntryRepository.findAllByOrderByStartTimeDesc();
    }

    // --- GRÁFICOS E RANKING ---

    public record ChartDataDTO(List<String> categories, List<Double> series) {}
    
    // DTO Novo para o Ranking
    public record RankingDTO(String name, Double totalHours) {}

    // Gráfico de Linha (Já existia)
    public ChartDataDTO getWeeklyTeamSummary() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDateTime start = sevenDaysAgo.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<TimeEntry> entries = timeEntryRepository.findAllByStartTimeBetweenOrderByStartTimeAsc(start, end);

        Map<LocalDate, Double> dailyTotals = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            dailyTotals.put(sevenDaysAgo.plusDays(i), 0.0);
        }

        for (TimeEntry entry : entries) {
            if (entry.getEndTime() != null) {
                LocalDate date = entry.getStartTime().toLocalDate();
                double hours = entry.getDurationSeconds() / 3600.0;
                if (dailyTotals.containsKey(date)) {
                    dailyTotals.put(date, dailyTotals.get(date) + hours);
                }
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        List<String> categories = new ArrayList<>();
        List<Double> series = new ArrayList<>();

        for (Map.Entry<LocalDate, Double> entry : dailyTotals.entrySet()) {
            categories.add(entry.getKey().format(formatter));
            series.add(Math.round(entry.getValue() * 100.0) / 100.0);
        }

        return new ChartDataDTO(categories, series);
    }

    // --- NOVO MÉTODO DE RANKING (Que estava faltando) ---
    public List<RankingDTO> getEmployeeRanking() {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6); // Mesma janela de 7 dias
        LocalDateTime start = sevenDaysAgo.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        List<TimeEntry> entries = timeEntryRepository.findAllByStartTimeBetweenOrderByStartTimeAsc(start, end);

        // Mapa temporário: Nome -> Segundos Totais
        Map<String, Long> rankingMap = new HashMap<>();

        for (TimeEntry entry : entries) {
            if (entry.getEndTime() != null && entry.getEmployee() != null) {
                String name = entry.getEmployee().getName();
                rankingMap.put(name, rankingMap.getOrDefault(name, 0L) + entry.getDurationSeconds());
            }
        }

        // Transforma o mapa em lista, converte segundos para horas e ordena
        return rankingMap.entrySet().stream()
                .map(entry -> new RankingDTO(
                        entry.getKey(),
                        Math.round((entry.getValue() / 3600.0) * 100.0) / 100.0 // Converte para Horas
                ))
                .sorted(Comparator.comparingDouble(RankingDTO::totalHours).reversed()) // Do maior para o menor
                .collect(Collectors.toList());
    }
}