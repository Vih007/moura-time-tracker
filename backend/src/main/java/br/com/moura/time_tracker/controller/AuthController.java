package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.dto.LoginRequest;
import br.com.moura.time_tracker.dto.LoginResponse;
import br.com.moura.time_tracker.exception.AuthenticationException;
import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.security.JwtUtil;
import br.com.moura.time_tracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "1. Autenticação", description = "Endpoints para login e obtenção de tokens")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Realizar Login", description = "Autentica usuário (Admin ou Colaborador) e retorna o Token JWT.")
    @SecurityRequirements()
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        try {
            UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(userAndPass);

            Employee employee = (Employee) authentication.getPrincipal();

            String token = jwtUtil.generateToken(employee.getId(), employee.getEmail());
            return ResponseEntity.ok(new LoginResponse(
                    employee.getId(),
                    employee.getName(),
                    employee.getEmail(),
                    employee.getRole(),
                    token
                    ));

        } catch (BadCredentialsException exception){
            throw new AuthenticationException("Usuário ou Senha invalidos");
        }
    }
}