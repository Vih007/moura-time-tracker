package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.dto.EmployeeResponse;
import br.com.moura.time_tracker.dto.ScheduleDto;
import br.com.moura.time_tracker.exception.DataNotFoundException;
import br.com.moura.time_tracker.model.Employee;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public  List<EmployeeResponse> findAll() {
        return employeeRepository.findAll().stream().map((e) -> new EmployeeResponse(
                e.getId(),
                e.getName(),
                e.getEmail(),
                e.getWorkStartTime(),
                e.getWorkEndTime(),
                e.getRole()
        )).collect(Collectors.toList());
    }

    @Transactional
    public void updateSchedule(UUID id, ScheduleDto schedule) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Funcionário não encontrado"));

        String start = schedule.getWorkStartTime();
        String end = schedule.getWorkEndTime();

        if (start != null) employee.setWorkStartTime(start);
        if (end != null) employee.setWorkEndTime(end);

        employeeRepository.save(employee);
    }

    public EmployeeResponse getEmployeeById(UUID id) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Funcionário não encontrado"));

        return new EmployeeResponse(
                e.getId(),
                e.getName(),
                e.getEmail(),
                e.getWorkStartTime(),
                e.getWorkEndTime(),
                e.getRole()
        );
    }
}
