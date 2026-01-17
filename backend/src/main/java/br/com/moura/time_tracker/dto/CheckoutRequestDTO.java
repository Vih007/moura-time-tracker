package br.com.moura.time_tracker.dto;

import lombok.Data;

@Data
public class CheckoutRequestDTO {
    private String reason_id;
    private String details;
}