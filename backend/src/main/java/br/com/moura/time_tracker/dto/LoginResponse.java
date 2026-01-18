package br.com.moura.time_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private UUID id;
    private String name;
    private String email;
    private String role; // <--- O NOVO CAMPO (ADMIN ou USER)
    private String token;
    private String type;

    // Atualizei o construtor para receber o ROLE também
    public LoginResponse(UUID id, String name, String email, String role, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role; // Atribui o papel
        this.token = token;
        this.type = "Bearer";
    }
}