package br.com.moura.time_tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeResponse {
    private UUID id;
    private String name;
    private String email;
    private String workStartTime;
    private String workEndTime;
    private String role;
}
