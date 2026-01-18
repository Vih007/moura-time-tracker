package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.dto.ApiResponse;
import br.com.moura.time_tracker.dto.CheckoutRequestDTO;
import br.com.moura.time_tracker.dto.WorkRecordResponseDTO;
import br.com.moura.time_tracker.service.WorkService;
import br.com.moura.time_tracker.service.WorkService.ChartDataDTO;
import br.com.moura.time_tracker.service.WorkService.RankingDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/work")
@RequiredArgsConstructor
@Tag(name = "3. Ponto Eletrônico", description = "Operações de registro de ponto, histórico e dashboard")
@SecurityRequirement(name = "bearer-jwt")
public class WorkController {

    private final WorkService workService;

    // --- REQUISITO 1: CHECK-IN ---
    @PostMapping("/checkin")
    @Operation(summary = "Fazer Check-in", description = "Inicia um novo turno de trabalho para o funcionário.")
    public ResponseEntity<ApiResponse<WorkRecordResponseDTO>> checkIn(
            @Parameter(description = "ID do funcionário (Simulado)") @RequestParam Long employeeId) {

        var record = workService.clockIn(employeeId);

        return ResponseEntity.ok(ApiResponse.success(
                "Check-in realizado com sucesso!",
                workService.getMyHistory(employeeId).get(0)
        ));
    }

    // --- REQUISITO 2: CHECK-OUT ---
    @PostMapping("/checkout")
    @Operation(summary = "Fazer Check-out", description = "Encerra o turno atual. Exige motivo e detalhes se for 'Outros'.")
    public ResponseEntity<ApiResponse<WorkRecordResponseDTO>> checkOut(
            @RequestParam Long employeeId,
            @RequestBody CheckoutRequestDTO request) {

        workService.clockOut(employeeId, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Check-out realizado com sucesso!",
                null
        ));
    }

    // --- REQUISITO 3: LISTAGEM ADMIN ---
    @GetMapping("/list")
    @Operation(summary = "Listagem Geral (Admin)", description = "Lista paginada de todos os registros de ponto com filtros.")
    public ResponseEntity<ApiResponse<Page<WorkRecordResponseDTO>>> listAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("checkInTime").descending());
        Page<WorkRecordResponseDTO> result = workService.getAllRecords(name, date, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lista recuperada", result));
    }

    // --- FUNCIONALIDADES EXTRAS ---
    @GetMapping("/my-history")
    @Operation(summary = "Meu Histórico", description = "Retorna todo o histórico de pontos do funcionário logado.")
    public ResponseEntity<ApiResponse<List<WorkRecordResponseDTO>>> getMyHistory(@RequestParam Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Histórico pessoal recuperado",
                workService.getMyHistory(employeeId)
        ));
    }

    @GetMapping("/weekly-summary")
    @Operation(summary = "Resumo Semanal (Gráfico)", description = "Dados consolidados para o gráfico de produtividade.")
    public ResponseEntity<ChartDataDTO> getWeeklySummary() {
        return ResponseEntity.ok(workService.getWeeklyTeamSummary());
    }

    @GetMapping("/ranking")
    @Operation(summary = "Ranking", description = "Lista de funcionários ordenada por horas trabalhadas.")
    public ResponseEntity<List<RankingDTO>> getRanking() {
        return ResponseEntity.ok(workService.getEmployeeRanking());
    }
}