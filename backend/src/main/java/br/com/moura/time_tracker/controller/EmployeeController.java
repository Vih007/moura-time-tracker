package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "2. Gestão de Funcionários", description = "Listagem e atualização de escalas (Acesso Admin)")
@SecurityRequirement(name = "bearer-jwt")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "Listar todos", description = "Retorna a lista completa de funcionários cadastrados.")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    @PutMapping("/{id}/schedule")
    @Operation(summary = "Atualizar Escala", description = "Define o horário de início e fim de expediente do funcionário.")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id, @RequestBody Map<String, String> schedule) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        String start = schedule.get("workStartTime");
        String end = schedule.get("workEndTime");

        if (start != null) employee.setWorkStartTime(start);
        if (end != null) employee.setWorkEndTime(end);

        employeeRepository.save(employee);

        return ResponseEntity.ok("Escala atualizada com sucesso!");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar por ID", description = "Retorna os detalhes de um funcionário específico.")
    public ResponseEntity<Employee> getEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}