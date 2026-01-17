package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.model.TimeEntry;
import br.com.moura.time_tracker.service.TimeEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/times")
@RequiredArgsConstructor
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

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

    // GET /api/times/all (Só o Admin deveria ver isso no futuro)
    @GetMapping("/all")
    public ResponseEntity<List<TimeEntry>> getAllHistory() {
        return ResponseEntity.ok(timeEntryService.getAllHistory());
    }
}