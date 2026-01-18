package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "2. Administrativo", description = "Gestão de equipe, relatórios, escalas e dashboards (Requer Role ADMIN)")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private final AdminService adminService;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard Geral (Status)", description = "Retorna o status atual de todos os colaboradores (quem está trabalhando e quem já finalizou).")
    public ResponseEntity<?> getTeamStatus() {
        return ResponseEntity.ok(adminService.getTeamCurrentStatus());
    }

    @GetMapping("/report")
    @Operation(summary = "Gerar Relatório Detalhado", description = "Busca registros de ponto filtrados por ID do funcionário e intervalo de datas.")
    public ResponseEntity<?> getReport(
            @RequestParam Long employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(adminService.generateReport(employeeId, startDate, endDate));
    }

    @GetMapping("/employees")
    @Operation(summary = "Listar Funcionários", description = "Retorna a lista completa de funcionários cadastrados no sistema.")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @PutMapping("/employees/{id}/schedule")
    @Operation(summary = "Atualizar Escala de Trabalho", description = "Define ou atualiza os horários de entrada e saída previstos para um funcionário.")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody Map<String, String> schedule) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionario não encontrado"));

        if(schedule.containsKey("workStartTime")) employee.setWorkStartTime(schedule.get("workStartTime"));
        if(schedule.containsKey("workEndTime")) employee.setWorkEndTime(schedule.get("workEndTime"));

        employeeRepository.save(employee);

        return ResponseEntity.ok(Map.of("message", "Escala atualizada com sucesso!"));
    }

    @GetMapping("/weekly-summary")
    @Operation(summary = "Gráfico Semanal", description = "Retorna os dados consolidados dos últimos 7 dias para o gráfico de produtividade da equipe.")
    public ResponseEntity<?> getWeeklySummary() {
        return ResponseEntity.ok(adminService.getWeeklyTeamSummary());
    }

    @GetMapping("/ranking")
    @Operation(summary = "Ranking de Produtividade", description = "Retorna uma lista de funcionários ordenada pelo total de horas trabalhadas na semana.")
    public ResponseEntity<?> getRanking() {
        return ResponseEntity.ok(adminService.getEmployeeRanking());
    }
}