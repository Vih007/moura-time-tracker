package br.com.moura.time_tracker.repository;

import br.com.moura.time_tracker.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime; 

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    // Busca histórico de um funcionário
    List<TimeEntry> findByEmployeeIdOrderByStartTimeDesc(Long employeeId);

    // Verifica ponto em aberto
    Optional<TimeEntry> findByEmployeeIdAndEndTimeIsNull(Long employeeId);

    // Busca TUDO (para lista geral do Admin)
    List<TimeEntry> findAllByOrderByStartTimeDesc();

    // Busca relatório específico de um funcionário
    List<TimeEntry> findByEmployeeIdAndStartTimeBetweenOrderByStartTimeDesc(
        Long employeeId, 
        LocalDateTime start, 
        LocalDateTime end
    );

    // --- NOVO (Para o Gráfico de Atividade Geral) ---
    // Busca TODOS os registros de TODOS os funcionários num intervalo
    List<TimeEntry> findAllByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end);
}