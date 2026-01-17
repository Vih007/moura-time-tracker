package br.com.moura.time_tracker.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkRecordResponseDTO {
    private Long id;
    private String date;           // "2026-01-16"
    private String checkin_time;   // "08:00:00"
    private String checkout_time;  // "17:05:00" or null
    private String duration;       // "08:05:00"
    private Long duration_seconds;
    private String reason_id;
    private String reason_label;
    private String details;
}