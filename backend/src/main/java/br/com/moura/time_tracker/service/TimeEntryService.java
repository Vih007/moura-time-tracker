package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.model.TimeEntry;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import br.com.moura.time_tracker.repository.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;

    // 1. Fazer Check-in (Iniciar Dia)
    public TimeEntry clockIn(Long employeeId) {
        // Verifica se já existe um ponto aberto para não duplicar
        var openEntry = timeEntryRepository.findByEmployeeIdAndEndTimeIsNull(employeeId);
        if (openEntry.isPresent()) {
            throw new RuntimeException("Você já tem um turno em andamento!");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

        TimeEntry newEntry = TimeEntry.builder()
                .employee(employee)
                .startTime(LocalDateTime.now())
                .build();

        return timeEntryRepository.save(newEntry);
    }

    // 2. Fazer Check-out (Finalizar Dia)
    public TimeEntry clockOut(Long employeeId) {
        TimeEntry entry = timeEntryRepository.findByEmployeeIdAndEndTimeIsNull(employeeId)
                .orElseThrow(() -> new RuntimeException("Não há turno aberto para finalizar!"));

        entry.setEndTime(LocalDateTime.now());
        
        // Calcula quanto tempo trabalhou (em segundos)
        long seconds = Duration.between(entry.getStartTime(), entry.getEndTime()).getSeconds();
        entry.setDurationSeconds(seconds);

        return timeEntryRepository.save(entry);
    }

    // 3. Buscar Histórico (Colaborador)
    public List<TimeEntry> getHistoryByEmployee(Long employeeId) {
        return timeEntryRepository.findByEmployeeIdOrderByStartTimeDesc(employeeId);
    }

    // 4. Buscar Tudo (Admin)
    public List<TimeEntry> getAllHistory() {
        return timeEntryRepository.findAllByOrderByStartTimeDesc();
    }
}