package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.dto.ApiResponse;
import br.com.moura.time_tracker.dto.CheckoutRequestDTO;
import br.com.moura.time_tracker.dto.WorkRecordResponseDTO;
import br.com.moura.time_tracker.service.WorkService;
import br.com.moura.time_tracker.service.WorkService.ChartDataDTO;
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

import java.util.UUID;

@RestController
@RequestMapping("/work")
@RequiredArgsConstructor
@Tag(name = "3. Ponto Eletrônico", description = "Operações do Colaborador (Check-in, Check-out, Histórico)")
@SecurityRequirement(name = "bearer-jwt")
public class WorkController {

    private final WorkService workService;

    // --- 1. CHECK-IN ---
    @PostMapping("/checkin")
    @Operation(summary = "Fazer Check-in", description = "Inicia o turno.")
    public ResponseEntity<ApiResponse<WorkRecordResponseDTO>> checkIn(
            @Parameter(description = "ID do funcionário") @RequestParam UUID employeeId) {

        var record = workService.clockIn(employeeId);

        Pageable p = PageRequest.of(0, 1);
        var latest = workService.getPersonalRecords(employeeId, null, p).getContent().get(0);
        return ResponseEntity.ok(ApiResponse.success("Check-in realizado!", latest));
    }

    // --- 2. CHECK-OUT ---
    @PostMapping("/checkout")
    @Operation(summary = "Fazer Check-out", description = "Encerra o turno com motivo.")
    public ResponseEntity<ApiResponse<Void>> checkOut(
            @RequestParam UUID employeeId,
            @RequestBody CheckoutRequestDTO request) {

        workService.clockOut(employeeId, request);
        return ResponseEntity.ok(ApiResponse.success("Check-out realizado!", null));
    }

    // --- 3. HISTÓRICO ---
    @GetMapping("/list")
    @Operation(summary = "Meu Histórico", description = "Lista paginada dos registros do funcionário logado.")
    public ResponseEntity<ApiResponse<Page<WorkRecordResponseDTO>>> listMyHistory(
            @RequestParam UUID employeeId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("checkInTime").descending());
        Page<WorkRecordResponseDTO> result = workService.getPersonalRecords(employeeId, date, pageable);

        return ResponseEntity.ok(ApiResponse.success("Histórico recuperado", result));
    }

    // --- 4. GRÁFICO PESSOAL ---
    @GetMapping("/weekly-summary")
    @Operation(summary = "Meu Desempenho Semanal", description = "Gráfico de horas trabalhadas do funcionário nos últimos 7 dias.")
    public ResponseEntity<ChartDataDTO> getMyWeeklySummary(@RequestParam UUID employeeId) {
        return ResponseEntity.ok(workService.getWeeklyPersonalSummary(employeeId));
    }
}