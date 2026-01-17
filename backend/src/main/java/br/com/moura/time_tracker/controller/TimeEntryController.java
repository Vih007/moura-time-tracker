package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.model.TimeEntry;
import br.com.moura.time_tracker.repository.TimeEntryRepository;
import br.com.moura.time_tracker.service.TimeEntryService;
// --- IMPORTS DOS DTOs ---
import br.com.moura.time_tracker.service.TimeEntryService.ChartDataDTO;
import br.com.moura.time_tracker.service.TimeEntryService.RankingDTO; // <--- Import Novo
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/times")
@RequiredArgsConstructor
public class TimeEntryController {

    private final TimeEntryService timeEntryService;
    private final TimeEntryRepository timeEntryRepository;

    // POST /api/times/clock-in?employeeId=1
    @PostMapping("/clock-in")
    public ResponseEntity<TimeEntry> clockIn(@RequestParam Long employeeId) {
        return ResponseEntity.ok(timeEntryService.clockIn(employeeId));
    }

    // POST /api/times/clock-out?employeeId=1
    @PostMapping("/clock-out")
    public ResponseEntity<TimeEntry> clockOut(@RequestParam Long employeeId) {
        return ResponseEntity.ok(timeEntryService.clockOut(employeeId));
    }

    // GET /api/times/my-history?employeeId=1
    @GetMapping("/my-history")
    public ResponseEntity<List<TimeEntry>> getMyHistory(@RequestParam Long employeeId) {
        return ResponseEntity.ok(timeEntryService.getHistoryByEmployee(employeeId));
    }

    // GET /api/times/all (Visão geral do Admin)
    @GetMapping("/all")
    public ResponseEntity<List<TimeEntry>> getAllHistory() {
        return ResponseEntity.ok(timeEntryService.getAllHistory());
    }

    // GET /api/times/report (Relatório individual)
    @GetMapping("/report")
    public ResponseEntity<List<TimeEntry>> getReport(
            @RequestParam Long employeeId,
            @RequestParam String startDate, 
            @RequestParam String endDate    
    ) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        return ResponseEntity.ok(timeEntryRepository.findByEmployeeIdAndStartTimeBetweenOrderByStartTimeDesc(
                employeeId, 
                start.atStartOfDay(), 
                end.atTime(LocalTime.MAX)
        ));
    }

    // GET /api/times/weekly-summary (Gráfico Geral)
    @GetMapping("/weekly-summary")
    public ResponseEntity<ChartDataDTO> getWeeklySummary() {
        return ResponseEntity.ok(timeEntryService.getWeeklyTeamSummary());
    }

    // --- NOVO ENDPOINT: RANKING DA EQUIPE ---
    // Esse é o endpoint que o botão de Troféu chama
    @GetMapping("/ranking")
    public ResponseEntity<List<RankingDTO>> getRanking() {
        return ResponseEntity.ok(timeEntryService.getEmployeeRanking());
    }
}