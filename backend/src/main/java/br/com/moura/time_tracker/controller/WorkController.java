package br.com.moura.time_tracker.controller;

import br.com.moura.time_tracker.dto.ApiResponse;
import br.com.moura.time_tracker.dto.CheckoutRequestDTO;
import br.com.moura.time_tracker.dto.WorkRecordResponseDTO;
import br.com.moura.time_tracker.service.WorkService;
// Imports dos DTOs de Ranking e Gráfico que estão dentro do Service
import br.com.moura.time_tracker.service.WorkService.ChartDataDTO;
import br.com.moura.time_tracker.service.WorkService.RankingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/work") // O PDF pede as rotas começando com /work
@RequiredArgsConstructor
public class WorkController {

    private final WorkService workService;

    // --- REQUISITO 1: CHECK-IN (POST /work/checkin) ---
    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<WorkRecordResponseDTO>> checkIn(@RequestParam Long employeeId) {
        // Nota: Em produção, pegaremos o ID do token JWT. Mantive o param para facilitar seu teste agora.
        var record = workService.clockIn(employeeId);

        // Convertendo para o DTO de resposta bonito
        return ResponseEntity.ok(ApiResponse.success(
            "Check-in realizado com sucesso!",
            // Pequena adaptação para retornar o DTO, não a entidade pura
            workService.getMyHistory(employeeId).get(0)
        ));
    }

    // --- REQUISITO 2: CHECK-OUT (POST /work/checkout) ---
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<WorkRecordResponseDTO>> checkOut(
            @RequestParam Long employeeId,
            @RequestBody CheckoutRequestDTO request) {

        workService.clockOut(employeeId, request);

        return ResponseEntity.ok(ApiResponse.success(
            "Check-out realizado com sucesso!",
            null // Não precisa retornar dados no checkout se não quiser
        ));
    }

    // --- REQUISITO 3: LISTAGEM ADMIN (GET /work/list) ---
    @GetMapping("/list")
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

    // --- FUNCIONALIDADES EXTRAS (Dashboard & Ranking) ---

    // Histórico do próprio funcionário
    @GetMapping("/my-history")
    public ResponseEntity<ApiResponse<List<WorkRecordResponseDTO>>> getMyHistory(@RequestParam Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Histórico pessoal recuperado",
            workService.getMyHistory(employeeId)
        ));
    }

    // Gráfico Semanal (Mantido!)
    @GetMapping("/weekly-summary")
    public ResponseEntity<ChartDataDTO> getWeeklySummary() {
        // Retorna direto o DTO simples para o gráfico funcionar fácil
        return ResponseEntity.ok(workService.getWeeklyTeamSummary());
    }

    // Ranking (Mantido!)
    @GetMapping("/ranking")
    public ResponseEntity<List<RankingDTO>> getRanking() {
        // Retorna direto a lista para o componente de Ranking
        return ResponseEntity.ok(workService.getEmployeeRanking());
    }
}