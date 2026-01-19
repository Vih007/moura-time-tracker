package br.com.moura.time_tracker.exception;

public class MissingDetailsForOtherReasonException extends RuntimeException {
    public MissingDetailsForOtherReasonException(String message) {
        super(message);
    }
}
