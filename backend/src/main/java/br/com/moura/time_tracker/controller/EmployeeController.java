package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.dto.EmployeeResponse;
import br.com.moura.time_tracker.dto.ScheduleDto;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "2. Gestão de Funcionários", description = "Listagem e atualização de escalas (Acesso Admin)")
@SecurityRequirement(name = "bearer-jwt")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "Listar todos", description = "Retorna a lista completa de funcionários cadastrados.")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.findAll());
    }

    @PutMapping("/{id}/schedule")
    @Operation(summary = "Atualizar Escala", description = "Define o horário de início e fim de expediente do funcionário.")
    public ResponseEntity<?> updateSchedule(@PathVariable UUID id, @Valid @RequestBody ScheduleDto schedule) {
        employeeService.updateSchedule(id, schedule);

        return ResponseEntity.ok("Escala atualizada com sucesso!");
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar por ID", description = "Retorna os detalhes de um funcionário específico.")
    public ResponseEntity<EmployeeResponse> getEmployee(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }
}