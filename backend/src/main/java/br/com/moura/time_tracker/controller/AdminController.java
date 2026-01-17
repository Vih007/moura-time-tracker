package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final EmployeeRepository employeeRepository;

    // 1. Dashboard: Status Geral da Equipe
    @GetMapping("/dashboard")
    public ResponseEntity<?> getTeamStatus() {
        return ResponseEntity.ok(adminService.getTeamCurrentStatus());
    }

    // 2. Relatórios
    @GetMapping("/report")
    public ResponseEntity<?> getReport(
            @RequestParam Long employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(adminService.generateReport(employeeId, startDate, endDate));
    }

    // 3. Gestão de Funcionários (Listagem)
    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    // 4. Atualizar Escala
    @PutMapping("/employees/{id}/schedule")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody Map<String, String> schedule) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionario não encontrado"));

        if(schedule.containsKey("workStartTime")) employee.setWorkStartTime(schedule.get("workStartTime"));
        if(schedule.containsKey("workEndTime")) employee.setWorkEndTime(schedule.get("workEndTime"));

        employeeRepository.save(employee);

        return ResponseEntity.ok(Map.of("message", "Escala atualizada com sucesso!"));
    }

    @GetMapping("/weekly-summary")
    public ResponseEntity<?> getWeeklySummary() {
        return ResponseEntity.ok(adminService.getWeeklyTeamSummary());
    }

    // NOVO: Ranking
    @GetMapping("/ranking")
    public ResponseEntity<?> getRanking() {
        return ResponseEntity.ok(adminService.getEmployeeRanking());
    }
}