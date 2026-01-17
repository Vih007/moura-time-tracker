package br.com.moura.time_tracker.repository;

import br.com.moura.time_tracker.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {

    // Busca todo o histórico de um funcionário específico (para o Dashboard dele)
    List<TimeEntry> findByEmployeeIdOrderByStartTimeDesc(Long employeeId);

    // Verifica se o funcionário tem algum ponto em aberto (check-in sem check-out)
    Optional<TimeEntry> findByEmployeeIdAndEndTimeIsNull(Long employeeId);

    // Busca TUDO de TODOS, ordenado pelo mais recente (para o Admin)
    List<TimeEntry> findAllByOrderByStartTimeDesc();
}