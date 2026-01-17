package br.com.moura.time_tracker.enums;

import lombok.Getter;

@Getter
public enum WorkReason {
    END_SHIFT("end_shift", "Fim de Expediente"),
    LUNCH_START("lunch_start", "Início de Almoço"),
    BREAK_START("break_start", "Pausa/Intervalo"),
    MEETING_START("meeting_start", "Reunião"),
    MEDICAL("medical", "Consulta Médica"),
    OTHER("other", "Outros");

    private final String code;
    private final String label;

    WorkReason(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public static WorkReason fromCode(String code) {
        for (WorkReason reason : values()) {
            if (reason.code.equalsIgnoreCase(code)) {
                return reason;
            }
        }
        throw new IllegalArgumentException("Motivo inválido: " + code);
    }
}