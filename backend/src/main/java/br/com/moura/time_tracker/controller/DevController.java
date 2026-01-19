package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.exception.DataNotFoundException;
import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
@Tag(name = "99. Área do Desenvolvedor", description = "Facilitadores para testes e demos")
public class DevController {

    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/token/admin")
    @Operation(summary = "Pegar Token ADMIN", description = "Gera um token instantâneo para o admin@moura.com")
    @SecurityRequirements()
    public ResponseEntity<?> getAdminToken() {
        Employee admin = employeeRepository.findByEmail("admin@moura.com")
                .orElseThrow(() -> new DataNotFoundException("Admin não encontrado no banco"));

        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRole());

        return ResponseEntity.ok(token);
    }

    @GetMapping("/token/user")
    @Operation(summary = "Pegar Token JOÃO", description = "Gera um token instantâneo para o joao@moura.com")
    @SecurityRequirements()
    public ResponseEntity<?> getUserToken() {
        Employee user = employeeRepository.findByEmail("joao@moura.com")
                .orElseThrow(() -> new DataNotFoundException("João não encontrado no banco"));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(token);
    }
}