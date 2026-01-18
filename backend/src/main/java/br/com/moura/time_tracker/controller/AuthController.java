package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.dto.LoginRequest;
import br.com.moura.time_tracker.dto.LoginResponse;
import br.com.moura.time_tracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "1. Autenticação", description = "Endpoints para login e obtenção de tokens")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Realizar Login", description = "Autentica usuário (Admin ou Colaborador) e retorna o Token JWT.")
    @SecurityRequirements()
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}