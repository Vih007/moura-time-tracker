package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.dto.LoginRequest;
import br.com.moura.time_tracker.dto.LoginResponse;
import br.com.moura.time_tracker.exception.AuthenticationException;
import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        // 1. Busca o usuário no banco
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Email ou senha inválidos"));

        // 2. Verifica a senha (usando o Hash correto agora)
        if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
            throw new AuthenticationException("Email ou senha inválidos");
        }

        // 3. Gera o Token
        String token = jwtUtil.generateToken(employee.getId(), employee.getEmail());

        // 4. Retorna a resposta COM O ROLE
        return new LoginResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(), // <--- Passando "ADMIN" ou "USER" para o Frontend
                token
        );
    }
}