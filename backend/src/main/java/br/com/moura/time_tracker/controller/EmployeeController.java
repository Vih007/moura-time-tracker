package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. Listar todos os funcionários (Para o Admin ver na tabela)
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeRepository.findAll());
    }

    // 2. Atualizar a Escala de um Funcionário
    @PutMapping("/{id}/schedule")
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
    
    // 3. Buscar dados de um único funcionário (Para o Dashboard do Colaborador saber sua escala)
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployee(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}