package br.com.moura.time_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleDto {
    @NotBlank
    private String workStartTime;
    @NotBlank
    private String workEndTime;
}
