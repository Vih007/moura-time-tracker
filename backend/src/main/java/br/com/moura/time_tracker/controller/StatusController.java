package br.com.moura.time_tracker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "0. Infraestrutura", description = "Health Checks e status do sistema")
public class StatusController {

    @GetMapping("/status")
    @Operation(summary = "Health Check", description = "Verifica se a API está online.")
    @SecurityRequirements()
    public String status() {
        return "Moura Time Tracker está rodando 🚀";
    }
}